/**
 * Storage Utility
 *
 * Dit bestand bevat hulpfuncties voor het werken met Supabase Storage
 * in de MarketPulse AI applicatie.
 */

const { supabase } = require('./supabase');

/**
 * Genereert een bestandspad voor een dataset
 * @param {String} projectId - Project ID
 * @param {String} platform - Platform (amazon, instagram, etc.)
 * @param {String} jobId - Job ID
 * @param {String} fileName - Bestandsnaam
 * @returns {String} - Bestandspad
 */
const getDatasetPath = (projectId, platform, jobId, fileName) => {
  return `${projectId}/${platform}/${jobId}/${fileName}`;
};

/**
 * Genereert een bestandspad voor een export
 * @param {String} projectId - Project ID
 * @param {String} type - Type export (report, visualization, etc.)
 * @param {String} fileName - Bestandsnaam
 * @returns {String} - Bestandspad
 */
const getExportPath = (projectId, type, fileName) => {
  return `${projectId}/${type}/${fileName}`;
};

/**
 * Upload een bestand naar de datasets bucket
 * @param {String} projectId - Project ID
 * @param {String} platform - Platform (amazon, instagram, etc.)
 * @param {String} jobId - Job ID
 * @param {File|Blob|String} file - Bestand om te uploaden
 * @param {String} fileName - Bestandsnaam
 * @param {Object} options - Upload opties
 * @returns {Promise<Object>} - Upload resultaat
 */
const uploadDataset = async (projectId, platform, jobId, file, fileName, options = {}) => {
  try {
    const path = getDatasetPath(projectId, platform, jobId, fileName);

    const { data, error } = await supabase.storage
      .from('datasets')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        ...options,
      });

    if (error) throw error;
    return { success: true, path, data };
  } catch (error) {
    console.error('Error uploading dataset:', error);
    return { success: false, error };
  }
};

/**
 * Upload een export bestand
 * @param {String} projectId - Project ID
 * @param {String} type - Type export (report, visualization, etc.)
 * @param {File|Blob|String} file - Bestand om te uploaden
 * @param {String} fileName - Bestandsnaam
 * @param {Object} options - Upload opties
 * @returns {Promise<Object>} - Upload resultaat
 */
const uploadExport = async (projectId, type, file, fileName, options = {}) => {
  try {
    const path = getExportPath(projectId, type, fileName);

    const { data, error } = await supabase.storage
      .from('exports')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        ...options,
      });

    if (error) throw error;
    return { success: true, path, data };
  } catch (error) {
    console.error('Error uploading export:', error);
    return { success: false, error };
  }
};

/**
 * Download een bestand uit de datasets bucket
 * @param {String} projectId - Project ID
 * @param {String} platform - Platform (amazon, instagram, etc.)
 * @param {String} jobId - Job ID
 * @param {String} fileName - Bestandsnaam
 * @returns {Promise<Object>} - Download resultaat
 */
const downloadDataset = async (projectId, platform, jobId, fileName) => {
  try {
    const path = getDatasetPath(projectId, platform, jobId, fileName);

    const { data, error } = await supabase.storage
      .from('datasets')
      .download(path);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error downloading dataset:', error);
    return { success: false, error };
  }
};

/**
 * Download een export bestand
 * @param {String} projectId - Project ID
 * @param {String} type - Type export (report, visualization, etc.)
 * @param {String} fileName - Bestandsnaam
 * @returns {Promise<Object>} - Download resultaat
 */
const downloadExport = async (projectId, type, fileName) => {
  try {
    const path = getExportPath(projectId, type, fileName);

    const { data, error } = await supabase.storage
      .from('exports')
      .download(path);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error downloading export:', error);
    return { success: false, error };
  }
};

/**
 * Haal een tijdelijke URL op voor een bestand in de datasets bucket
 * @param {String} projectId - Project ID
 * @param {String} platform - Platform (amazon, instagram, etc.)
 * @param {String} jobId - Job ID
 * @param {String} fileName - Bestandsnaam
 * @param {Number} expiresIn - Aantal seconden dat de URL geldig is
 * @returns {Promise<Object>} - URL resultaat
 */
const getDatasetUrl = async (projectId, platform, jobId, fileName, expiresIn = 3600) => {
  try {
    const path = getDatasetPath(projectId, platform, jobId, fileName);

    const { data, error } = await supabase.storage
      .from('datasets')
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return { success: true, url: data.signedUrl };
  } catch (error) {
    console.error('Error getting dataset URL:', error);
    return { success: false, error };
  }
};

/**
 * Haal een tijdelijke URL op voor een export bestand
 * @param {String} projectId - Project ID
 * @param {String} type - Type export (report, visualization, etc.)
 * @param {String} fileName - Bestandsnaam
 * @param {Number} expiresIn - Aantal seconden dat de URL geldig is
 * @returns {Promise<Object>} - URL resultaat
 */
const getExportUrl = async (projectId, type, fileName, expiresIn = 3600) => {
  try {
    const path = getExportPath(projectId, type, fileName);

    const { data, error } = await supabase.storage
      .from('exports')
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return { success: true, url: data.signedUrl };
  } catch (error) {
    console.error('Error getting export URL:', error);
    return { success: false, error };
  }
};

/**
 * Verwijder een bestand uit de datasets bucket
 * @param {String} projectId - Project ID
 * @param {String} platform - Platform (amazon, instagram, etc.)
 * @param {String} jobId - Job ID
 * @param {String} fileName - Bestandsnaam
 * @returns {Promise<Object>} - Verwijder resultaat
 */
const deleteDataset = async (projectId, platform, jobId, fileName) => {
  try {
    const path = getDatasetPath(projectId, platform, jobId, fileName);

    const { error } = await supabase.storage
      .from('datasets')
      .remove([path]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting dataset:', error);
    return { success: false, error };
  }
};

/**
 * Verwijder een export bestand
 * @param {String} projectId - Project ID
 * @param {String} type - Type export (report, visualization, etc.)
 * @param {String} fileName - Bestandsnaam
 * @returns {Promise<Object>} - Verwijder resultaat
 */
const deleteExport = async (projectId, type, fileName) => {
  try {
    const path = getExportPath(projectId, type, fileName);

    const { error } = await supabase.storage
      .from('exports')
      .remove([path]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting export:', error);
    return { success: false, error };
  }
};

/**
 * Haal een lijst op van bestanden in een map in de datasets bucket
 * @param {String} projectId - Project ID
 * @param {String} platform - Platform (amazon, instagram, etc.)
 * @param {String} jobId - Job ID (optioneel)
 * @returns {Promise<Object>} - Lijst resultaat
 */
const listDatasets = async (projectId, platform, jobId = null) => {
  try {
    const path = jobId
      ? `${projectId}/${platform}/${jobId}`
      : `${projectId}/${platform}`;

    const { data, error } = await supabase.storage
      .from('datasets')
      .list(path);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error listing datasets:', error);
    return { success: false, error };
  }
};

/**
 * Haal een lijst op van bestanden in een map in de exports bucket
 * @param {String} projectId - Project ID
 * @param {String} type - Type export (report, visualization, etc.)
 * @returns {Promise<Object>} - Lijst resultaat
 */
const listExports = async (projectId, type) => {
  try {
    const path = `${projectId}/${type}`;

    const { data, error } = await supabase.storage
      .from('exports')
      .list(path);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error listing exports:', error);
    return { success: false, error };
  }
};

/**
 * Controleer of een bestand bestaat in de datasets bucket
 * @param {String} projectId - Project ID
 * @param {String} platform - Platform (amazon, instagram, etc.)
 * @param {String} jobId - Job ID
 * @param {String} fileName - Bestandsnaam
 * @returns {Promise<Boolean>} - True als het bestand bestaat, anders False
 */
const datasetExists = async (projectId, platform, jobId, fileName) => {
  try {
    // Controleer of het bestand al bestaat
    const { data } = await listDatasets(projectId, platform, jobId);

    if (!data || !Array.isArray(data)) {
      return false;
    }

    const filePath = getDatasetPath(projectId, platform, jobId, fileName);
    return data.some((file) => file.name === filePath);
  } catch (error) {
    console.error('Error checking if dataset exists:', error);
    return false;
  }
};

/**
 * Controleer of een bestand bestaat in de exports bucket
 * @param {String} projectId - Project ID
 * @param {String} type - Type export (report, visualization, etc.)
 * @param {String} fileName - Bestandsnaam
 * @returns {Promise<Boolean>} - True als het bestand bestaat, anders False
 */
const exportExists = async (projectId, type, fileName) => {
  try {
    // Controleer of het bestand al bestaat
    const { data } = await listExports(projectId, type);

    if (!data || !Array.isArray(data)) {
      return false;
    }

    const filePath = getExportPath(projectId, type, fileName);
    return data.some((file) => file.name === filePath);
  } catch (error) {
    console.error('Error checking if export exists:', error);
    return false;
  }
};

/**
 * Kopieer een bestand binnen de datasets bucket
 * @param {String} sourceProjectId - Bron project ID
 * @param {String} sourcePlatform - Bron platform
 * @param {String} sourceJobId - Bron job ID
 * @param {String} sourceFileName - Bron bestandsnaam
 * @param {String} destProjectId - Doel project ID
 * @param {String} destPlatform - Doel platform
 * @param {String} destJobId - Doel job ID
 * @param {String} destFileName - Doel bestandsnaam
 * @returns {Promise<Object>} - Kopieer resultaat
 */
const copyDataset = async (
  sourceProjectId,
  sourcePlatform,
  sourceJobId,
  sourceFileName,
  destProjectId,
  destPlatform,
  destJobId,
  destFileName,
) => {
  try {
    const sourcePath = getDatasetPath(sourceProjectId, sourcePlatform, sourceJobId, sourceFileName);
    const destPath = getDatasetPath(destProjectId, destPlatform, destJobId, destFileName);

    const { data, error } = await supabase.storage
      .from('datasets')
      .copy(sourcePath, destPath);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error copying dataset:', error);
    return { success: false, error };
  }
};

/**
 * Kopieer een bestand binnen de exports bucket
 * @param {String} sourceProjectId - Bron project ID
 * @param {String} sourceType - Bron type
 * @param {String} sourceFileName - Bron bestandsnaam
 * @param {String} destProjectId - Doel project ID
 * @param {String} destType - Doel type
 * @param {String} destFileName - Doel bestandsnaam
 * @returns {Promise<Object>} - Kopieer resultaat
 */
const copyExport = async (
  sourceProjectId,
  sourceType,
  sourceFileName,
  destProjectId,
  destType,
  destFileName,
) => {
  try {
    const sourcePath = getExportPath(sourceProjectId, sourceType, sourceFileName);
    const destPath = getExportPath(destProjectId, destType, destFileName);

    const { data, error } = await supabase.storage
      .from('exports')
      .copy(sourcePath, destPath);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error copying export:', error);
    return { success: false, error };
  }
};

/**
 * Verplaats een bestand binnen de datasets bucket
 * @param {String} sourceProjectId - Bron project ID
 * @param {String} sourcePlatform - Bron platform
 * @param {String} sourceJobId - Bron job ID
 * @param {String} sourceFileName - Bron bestandsnaam
 * @param {String} destProjectId - Doel project ID
 * @param {String} destPlatform - Doel platform
 * @param {String} destJobId - Doel job ID
 * @param {String} destFileName - Doel bestandsnaam
 * @returns {Promise<Object>} - Verplaats resultaat
 */
const moveDataset = async (
  sourceProjectId,
  sourcePlatform,
  sourceJobId,
  sourceFileName,
  destProjectId,
  destPlatform,
  destJobId,
  destFileName,
) => {
  try {
    const sourcePath = getDatasetPath(sourceProjectId, sourcePlatform, sourceJobId, sourceFileName);
    const destPath = getDatasetPath(destProjectId, destPlatform, destJobId, destFileName);

    const { data, error } = await supabase.storage
      .from('datasets')
      .move(sourcePath, destPath);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error moving dataset:', error);
    return { success: false, error };
  }
};

/**
 * Verplaats een bestand binnen de exports bucket
 * @param {String} sourceProjectId - Bron project ID
 * @param {String} sourceType - Bron type
 * @param {String} sourceFileName - Bron bestandsnaam
 * @param {String} destProjectId - Doel project ID
 * @param {String} destType - Doel type
 * @param {String} destFileName - Doel bestandsnaam
 * @returns {Promise<Object>} - Verplaats resultaat
 */
const moveExport = async (
  sourceProjectId,
  sourceType,
  sourceFileName,
  destProjectId,
  destType,
  destFileName,
) => {
  try {
    const sourcePath = getExportPath(sourceProjectId, sourceType, sourceFileName);
    const destPath = getExportPath(destProjectId, destType, destFileName);

    const { data, error } = await supabase.storage
      .from('exports')
      .move(sourcePath, destPath);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error moving export:', error);
    return { success: false, error };
  }
};

/**
 * Upload een JSON bestand naar de datasets bucket
 * @param {String} projectId - Project ID
 * @param {String} platform - Platform (amazon, instagram, etc.)
 * @param {String} jobId - Job ID
 * @param {Object} data - JSON data
 * @param {String} fileName - Bestandsnaam
 * @returns {Promise<Object>} - Upload resultaat
 */
const uploadJsonDataset = async (projectId, platform, jobId, data, fileName) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    return await uploadDataset(projectId, platform, jobId, blob, fileName, {
      contentType: 'application/json',
    });
  } catch (error) {
    console.error('Error uploading JSON dataset:', error);
    return { success: false, error };
  }
};

/**
 * Upload een JSON bestand naar de exports bucket
 * @param {String} projectId - Project ID
 * @param {String} type - Type export (report, visualization, etc.)
 * @param {Object} data - JSON data
 * @param {String} fileName - Bestandsnaam
 * @returns {Promise<Object>} - Upload resultaat
 */
const uploadJsonExport = async (projectId, type, data, fileName) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    return await uploadExport(projectId, type, blob, fileName, {
      contentType: 'application/json',
    });
  } catch (error) {
    console.error('Error uploading JSON export:', error);
    return { success: false, error };
  }
};

/**
 * Download en parse een JSON bestand uit de datasets bucket
 * @param {String} projectId - Project ID
 * @param {String} platform - Platform (amazon, instagram, etc.)
 * @param {String} jobId - Job ID
 * @param {String} fileName - Bestandsnaam
 * @returns {Promise<Object>} - Download resultaat
 */
const downloadJsonDataset = async (projectId, platform, jobId, fileName) => {
  try {
    const { success, data, error } = await downloadDataset(projectId, platform, jobId, fileName);

    if (!success) throw error;

    const jsonData = JSON.parse(await data.text());
    return { success: true, data: jsonData };
  } catch (error) {
    console.error('Error downloading JSON dataset:', error);
    return { success: false, error };
  }
};

/**
 * Download en parse een JSON bestand uit de exports bucket
 * @param {String} projectId - Project ID
 * @param {String} type - Type export (report, visualization, etc.)
 * @param {String} fileName - Bestandsnaam
 * @returns {Promise<Object>} - Download resultaat
 */
const downloadJsonExport = async (projectId, type, fileName) => {
  try {
    const { success, data, error } = await downloadExport(projectId, type, fileName);

    if (!success) throw error;

    const jsonData = JSON.parse(await data.text());
    return { success: true, data: jsonData };
  } catch (error) {
    console.error('Error downloading JSON export:', error);
    return { success: false, error };
  }
};

module.exports = {
  getDatasetPath,
  getExportPath,
  uploadDataset,
  uploadExport,
  downloadDataset,
  downloadExport,
  getDatasetUrl,
  getExportUrl,
  deleteDataset,
  deleteExport,
  listDatasets,
  listExports,
  datasetExists,
  exportExists,
  copyDataset,
  copyExport,
  moveDataset,
  moveExport,
  uploadJsonDataset,
  uploadJsonExport,
  downloadJsonDataset,
  downloadJsonExport,
};
