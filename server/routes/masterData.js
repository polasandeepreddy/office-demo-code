import express from 'express';
import Joi from 'joi';
import { pgClient } from '../config/postgres.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Schemas
const bankSchema = Joi.object({
  name: Joi.string().required(),
  branch: Joi.string().required()
});

const propertyTypeSchema = Joi.object({
  category: Joi.string().required(),
  name: Joi.string().required()
});

const locationSchema = Joi.object({
  state: Joi.string().required(),
  district: Joi.string().required(),
  city: Joi.string().required()
});

const configSchema = Joi.object({
  config_type: Joi.string().required(),
  key: Joi.string().required(),
  value: Joi.any().required()
});

// ---------- BANKS ----------
router.get('/banks', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await pgClient
      .from('banks')
      .select('*')
      .order('name');
    if (error) throw error;
    res.json({ results: data });
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({ error: 'Failed to fetch banks' });
  }
});

router.post('/banks', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error: validationError } = bankSchema.validate(req.body);
    if (validationError) return res.status(400).json({ error: validationError.details[0].message });

    const { data, error } = await pgClient
      .from('banks')
      .insert(req.body)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create bank error:', error);
    res.status(500).json({ error: 'Failed to create bank' });
  }
});

router.put('/banks/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError } = bankSchema.validate(req.body);
    if (validationError) return res.status(400).json({ error: validationError.details[0].message });

    const { data, error } = await pgClient
      .from('banks')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update bank error:', error);
    res.status(500).json({ error: 'Failed to update bank' });
  }
});

router.delete('/banks/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await pgClient.from('banks').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Delete bank error:', error);
    res.status(500).json({ error: 'Failed to delete bank' });
  }
});

// ---------- PROPERTY TYPES ----------
router.get('/property-types', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await pgClient
      .from('property_types')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    res.json({ results: data });
  } catch (error) {
    console.error('Get property types error:', error);
    res.status(500).json({ error: 'Failed to fetch property types' });
  }
});

router.post('/property-types', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error: validationError } = propertyTypeSchema.validate(req.body);
    if (validationError) return res.status(400).json({ error: validationError.details[0].message });

    const { data, error } = await pgClient
      .from('property_types')
      .insert(req.body)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create property type error:', error);
    res.status(500).json({ error: 'Failed to create property type' });
  }
});

router.put('/property-types/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError } = propertyTypeSchema.validate(req.body);
    if (validationError) return res.status(400).json({ error: validationError.details[0].message });

    const { data, error } = await pgClient
      .from('property_types')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update property type error:', error);
    res.status(500).json({ error: 'Failed to update property type' });
  }
});

router.delete('/property-types/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await pgClient.from('property_types').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Delete property type error:', error);
    res.status(500).json({ error: 'Failed to delete property type' });
  }
});

// ---------- LOCATIONS ----------
router.get('/locations', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await pgClient
      .from('locations')
      .select('*')
      .order('state')
      .order('district')
      .order('city');
    if (error) throw error;
    res.json({ results: data });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

router.post('/locations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error: validationError } = locationSchema.validate(req.body);
    if (validationError) return res.status(400).json({ error: validationError.details[0].message });

    const { data, error } = await pgClient
      .from('locations')
      .insert(req.body)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

router.put('/locations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError } = locationSchema.validate(req.body);
    if (validationError) return res.status(400).json({ error: validationError.details[0].message });

    const { data, error } = await pgClient
      .from('locations')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

router.delete('/locations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await pgClient.from('locations').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

// ---------- SYSTEM CONFIGURATIONS ----------
router.get('/config', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await pgClient
      .from('system_configurations')
      .select(`*, created_by_name:created_by(full_name)`)
      .order('config_type')
      .order('key');
    if (error) throw error;
    res.json({ results: data });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Failed to fetch configurations' });
  }
});

router.post('/config', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error: validationError } = configSchema.validate(req.body);
    if (validationError) return res.status(400).json({ error: validationError.details[0].message });

    const configData = { ...req.body, created_by: req.user.id };
    const { data, error } = await pgClient
      .from('system_configurations')
      .insert(configData)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create config error:', error);
    res.status(500).json({ error: 'Failed to create configuration' });
  }
});

router.put('/config/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError } = configSchema.validate(req.body);
    if (validationError) return res.status(400).json({ error: validationError.details[0].message });

    const { data, error } = await pgClient
      .from('system_configurations')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

router.delete('/config/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await pgClient.from('system_configurations').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Delete config error:', error);
    res.status(500).json({ error: 'Failed to delete configuration' });
  }
});

export default router;
