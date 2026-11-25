import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createTemplate,
  deleteTemplate,
  listTemplates,
  updateTemplate,
} from '../services/template.service.js';

export const getTemplates = asyncHandler(async (_req, res) => {
  const templates = await listTemplates();
  res.status(200).json({ success: true, data: templates });
});

export const postTemplate = asyncHandler(async (req, res) => {
  const template = await createTemplate(req.body);
  res.status(201).json({ success: true, data: template });
});

export const patchTemplate = asyncHandler(async (req, res) => {
  const template = await updateTemplate(req.params.id, req.body);
  res.status(200).json({ success: true, data: template });
});

export const removeTemplate = asyncHandler(async (req, res) => {
  await deleteTemplate(req.params.id);
  res.status(200).json({ success: true, data: { message: 'Template deleted' } });
});

