/**
 * DashboardPersonalizationButton.jsx
 * 
 * Component voor het openen van de dashboard personalisatie modal.
 */

import React, { useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardPersonalizationModal from './DashboardPersonalizationModal';

/**
 * DashboardPersonalizationButton component
 * @component
 */
const DashboardPersonalizationButton = () => {
  const [openModal, setOpenModal] = useState(false);
  
  // Handler voor openen van modal
  const handleOpenModal = () => {
    setOpenModal(true);
  };
  
  // Handler voor sluiten van modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  
  return (
    <>
      <Tooltip title="Dashboard personaliseren">
        <Button
          variant="outlined"
          color="primary"
          startIcon={<SettingsIcon />}
          onClick={handleOpenModal}
          size="small"
        >
          Personaliseren
        </Button>
      </Tooltip>
      
      <DashboardPersonalizationModal
        open={openModal}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default DashboardPersonalizationButton;