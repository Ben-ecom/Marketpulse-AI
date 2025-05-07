import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Share as ShareIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarTodayIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

/**
 * Component voor acties op aanbevelingen zoals delen, toewijzen, plannen
 */
const RecommendationActions = ({
  recommendationId,
  onAssign,
  onSchedule,
  onShare,
  onDelete,
  onEdit,
  onArchive,
  onRefresh
}) => {
  // State voor dialogen
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // State voor formuliervelden
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notifyAssignee, setNotifyAssignee] = useState(true);
  const [shareEmail, setShareEmail] = useState('');
  const [shareNote, setShareNote] = useState('');
  
  // Handlers voor dialogen
  const handleOpenAssignDialog = () => setAssignDialogOpen(true);
  const handleCloseAssignDialog = () => setAssignDialogOpen(false);
  
  const handleOpenScheduleDialog = () => setScheduleDialogOpen(true);
  const handleCloseScheduleDialog = () => setScheduleDialogOpen(false);
  
  const handleOpenShareDialog = () => setShareDialogOpen(true);
  const handleCloseShareDialog = () => setShareDialogOpen(false);
  
  const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
  const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);
  
  // Handlers voor acties
  const handleAssign = () => {
    if (onAssign) {
      onAssign(recommendationId, { assignee, notifyAssignee });
    }
    handleCloseAssignDialog();
    setAssignee('');
    setNotifyAssignee(true);
  };
  
  const handleSchedule = () => {
    if (onSchedule) {
      onSchedule(recommendationId, { dueDate });
    }
    handleCloseScheduleDialog();
    setDueDate('');
  };
  
  const handleShare = () => {
    if (onShare) {
      onShare(recommendationId, { email: shareEmail, note: shareNote });
    }
    handleCloseShareDialog();
    setShareEmail('');
    setShareNote('');
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(recommendationId);
    }
    handleCloseDeleteDialog();
  };
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(recommendationId);
    }
  };
  
  const handleArchive = () => {
    if (onArchive) {
      onArchive(recommendationId);
    }
  };
  
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(recommendationId);
    }
  };
  
  return (
    <>
      {/* Actieknoppen */}
      <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
        <Tooltip title="Toewijzen aan teamlid">
          <Button
            size="small"
            variant="outlined"
            startIcon={<AssignmentIcon />}
            onClick={handleOpenAssignDialog}
          >
            Toewijzen
          </Button>
        </Tooltip>
        
        <Tooltip title="Plan implementatie">
          <Button
            size="small"
            variant="outlined"
            startIcon={<CalendarTodayIcon />}
            onClick={handleOpenScheduleDialog}
          >
            Plannen
          </Button>
        </Tooltip>
        
        <Tooltip title="Deel aanbeveling">
          <Button
            size="small"
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleOpenShareDialog}
          >
            Delen
          </Button>
        </Tooltip>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Tooltip title="Bewerk aanbeveling">
          <IconButton size="small" onClick={handleEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Archiveer aanbeveling">
          <IconButton size="small" onClick={handleArchive}>
            <ArchiveIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Ververs aanbeveling">
          <IconButton size="small" onClick={handleRefresh}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Verwijder aanbeveling">
          <IconButton size="small" color="error" onClick={handleOpenDeleteDialog}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      
      {/* Toewijzen Dialog */}
      <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog}>
        <DialogTitle>Aanbeveling toewijzen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wijs deze aanbeveling toe aan een teamlid voor implementatie.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="assignee"
            label="Naam of e-mail van teamlid"
            type="text"
            fullWidth
            variant="outlined"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            sx={{ mt: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={notifyAssignee} 
                onChange={(e) => setNotifyAssignee(e.target.checked)} 
              />
            }
            label="Stuur notificatie naar teamlid"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Annuleren</Button>
          <Button 
            onClick={handleAssign} 
            variant="contained" 
            disabled={!assignee.trim()}
          >
            Toewijzen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Plannen Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={handleCloseScheduleDialog}>
        <DialogTitle>Plan implementatie</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Plan een datum voor de implementatie van deze aanbeveling.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="dueDate"
            label="Implementatiedatum"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseScheduleDialog}>Annuleren</Button>
          <Button 
            onClick={handleSchedule} 
            variant="contained" 
            disabled={!dueDate}
          >
            Plannen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delen Dialog */}
      <Dialog open={shareDialogOpen} onClose={handleCloseShareDialog}>
        <DialogTitle>Deel aanbeveling</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deel deze aanbeveling met een collega of externe stakeholder.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="shareEmail"
            label="E-mailadres"
            type="email"
            fullWidth
            variant="outlined"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            id="shareNote"
            label="Persoonlijke notitie (optioneel)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={shareNote}
            onChange={(e) => setShareNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDialog}>Annuleren</Button>
          <Button 
            onClick={handleShare} 
            variant="contained" 
            disabled={!shareEmail.trim()}
          >
            Delen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Verwijderen Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Aanbeveling verwijderen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Weet je zeker dat je deze aanbeveling wilt verwijderen? 
            Deze actie kan niet ongedaan worden gemaakt.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuleren</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Verwijderen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

RecommendationActions.propTypes = {
  recommendationId: PropTypes.string.isRequired,
  onAssign: PropTypes.func,
  onSchedule: PropTypes.func,
  onShare: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onArchive: PropTypes.func,
  onRefresh: PropTypes.func
};

export default RecommendationActions;
