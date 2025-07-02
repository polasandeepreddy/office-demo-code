import express from 'express';
import multer from 'multer';
import path from 'path';
import { pgClient } from '../config/postgres.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    cb(null, mimetype && extname);
  }
});

router.post('/', authenticateToken, upload.array('documents'), async (req, res) => {
  try {
    const fileId = `JA${Date.now().toString().slice(-6)}`;
    const {
      owner_name,
      property_address,
      bank_id,
      property_type_id,
      location_id,
      validator_id,
      key_in_operator_id,
      verification_officer_id
    } = req.body;

    const insertFile = await pgClient.query(
      `INSERT INTO property_files (
        file_id, owner_name, property_address, bank_id, property_type_id, location_id,
        coordinator_id, created_by, validator_id, key_in_operator_id, verification_officer_id,
        status, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW()) RETURNING id`,
      [
        fileId,
        owner_name,
        property_address,
        bank_id,
        property_type_id,
        location_id,
        req.user.id,
        req.user.id,
        validator_id || null,
        key_in_operator_id || null,
        verification_officer_id || null,
        'validation'
      ]
    );

    const propertyFileId = insertFile.rows[0].id;

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await pgClient.query(
          `INSERT INTO documents (
            property_file_id, name, document_type, file_url,
            file_size, mime_type, uploaded_by
          ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            propertyFileId,
            file.originalname,
            'other',
            `/uploads/${file.filename}`,
            file.size,
            file.mimetype,
            req.user.id
          ]
        );
      }
    }

    const notifications = [];

    if (validator_id) {
      notifications.push([
        validator_id,
        req.user.id,
        'info',
        '📋 New File Assignment',
        `You have been assigned to validate property file ${fileId}`,
        propertyFileId,
        'file_assigned'
      ]);
    }

    if (key_in_operator_id) {
      notifications.push([
        key_in_operator_id,
        req.user.id,
        'info',
        '⌨️ Future Assignment',
        `You will handle data entry for file ${fileId} after validation`,
        propertyFileId,
        'file_assigned'
      ]);
    }

    for (const note of notifications) {
      await pgClient.query(
        `INSERT INTO notifications (
          recipient_id, sender_id, type, title, message, property_file_id, action_type
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        note
      );
    }

    await pgClient.query(
      `INSERT INTO audit_logs (
        user_id, action_type, model_name, object_id, object_repr, changes, ip_address, user_agent
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        req.user.id,
        'create',
        'PropertyFile',
        propertyFileId,
        fileId,
        JSON.stringify({ created: req.body }),
        req.ip,
        req.headers['user-agent']
      ]
    );

    res.status(201).json({ message: 'File created successfully', file_id: fileId });
  } catch (err) {
    console.error('Create file error:', err);
    res.status(500).json({ error: 'Failed to create file' });
  }
});

router.post('/:id/validation', authenticateToken, upload.array('photos'), async (req, res) => {
  try {
    const { id } = req.params;
    const validationData = JSON.parse(req.body.validation_data);

    const insertValidation = await pgClient.query(
      `INSERT INTO validation_data 
      (property_file_id, gps_latitude, gps_longitude, gps_accuracy, property_condition, access_notes, visit_date, visit_time, weather_conditions, validated_by, extended_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [id, validationData.gps_latitude, validationData.gps_longitude, validationData.gps_accuracy, validationData.property_condition, validationData.access_notes, validationData.visit_date, validationData.visit_time, validationData.weather_conditions, req.user.id, validationData.extended_data || {}]
    );

    const validationId = insertValidation.rows[0].id;

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const photoType = validationData.photo_types?.[i] || 'other';
        const caption = validationData.photo_captions?.[i] || '';

        await pgClient.query(
          `INSERT INTO validation_photos (validation_data_id, photo_url, photo_type, caption)
           VALUES ($1, $2, $3, $4)`,
          [validationId, `/uploads/${file.filename}`, photoType, caption]
        );
      }
    }

    await pgClient.query(
      `UPDATE property_files SET status = $1, updated_at = NOW() WHERE id = $2`,
      ['data-entry', id]
    );

    res.json({ message: 'Validation data saved successfully' });
  } catch (err) {
    console.error('Save validation data error:', err);
    res.status(500).json({ error: 'Failed to save validation data' });
  }
});

router.post('/:id/property-data', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const propertyData = req.body;

    const insertResult = await pgClient.query(
      `INSERT INTO property_data (
        property_file_id, length, width, area, built_up_area, carpet_area,
        construction_type, construction_material, construction_condition,
        year_built, floors, estimated_value, market_rate, government_rate,
        valuation_notes, entered_by, entry_date, data_source, custom_data
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),$17,$18) RETURNING *`,
      [
        id,
        propertyData.measurements?.length,
        propertyData.measurements?.width,
        propertyData.measurements?.area,
        propertyData.measurements?.built_up_area,
        propertyData.measurements?.carpet_area,
        propertyData.constructionDetails?.type,
        propertyData.constructionDetails?.material,
        propertyData.constructionDetails?.condition,
        propertyData.constructionDetails?.yearBuilt,
        propertyData.constructionDetails?.floors,
        propertyData.valuation?.estimatedValue,
        propertyData.valuation?.marketRate,
        propertyData.valuation?.governmentRate,
        propertyData.valuation?.notes,
        req.user.id,
        propertyData.data_source,
        propertyData.customData || {}
      ]
    );

    await pgClient.query(
      `UPDATE property_files SET status = $1, updated_at = NOW() WHERE id = $2`,
      ['verification', id]
    );

    res.json({ message: 'Property data saved successfully' });
  } catch (err) {
    console.error('Save property data error:', err);
    res.status(500).json({ error: 'Failed to save property data' });
  }
});

export default router;
