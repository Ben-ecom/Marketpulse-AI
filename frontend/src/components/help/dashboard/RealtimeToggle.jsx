/**
 * RealtimeToggle.jsx
 * 
 * Component voor het in- en uitschakelen van real-time updates.
 * Toont ook de laatste update tijd.
 */

import React from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useRealtime } from './RealtimeProvider';
import { Button, Switch, Tooltip, Badge, Space, Typography } from 'antd';
import { SyncOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Component voor het beheren van real-time updates
 * @component
 */
const RealtimeToggle = () => {
  const { isRealtime, enableRealtime, disableRealtime, refreshData, lastUpdate } = useRealtime();
  
  // Formatteer de laatste update tijd
  const formattedLastUpdate = lastUpdate 
    ? format(lastUpdate, 'dd MMMM yyyy HH:mm:ss', { locale: nl })
    : 'Nooit';
  
  // Handler voor de toggle switch
  const handleToggleChange = (checked) => {
    if (checked) {
      enableRealtime();
    } else {
      disableRealtime();
    }
  };
  
  return (
    <Space direction="vertical" size="small" style={{ display: 'flex', alignItems: 'flex-end' }}>
      <Space align="center">
        <Tooltip title={isRealtime ? "Real-time updates uitschakelen" : "Real-time updates inschakelen"}>
          <Switch 
            checked={isRealtime} 
            onChange={handleToggleChange} 
            checkedChildren="Real-time aan" 
            unCheckedChildren="Real-time uit"
          />
        </Tooltip>
        
        <Tooltip title="Handmatig verversen">
          <Button 
            icon={<SyncOutlined />} 
            onClick={refreshData}
            type="primary"
            ghost
            size="small"
          >
            Verversen
          </Button>
        </Tooltip>
      </Space>
      
      <Space>
        <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Laatste update: {formattedLastUpdate}
        </Text>
        {isRealtime && (
          <Badge 
            status="processing" 
            text={<Text type="secondary" style={{ fontSize: '12px' }}>Live</Text>} 
          />
        )}
      </Space>
    </Space>
  );
};

export default RealtimeToggle;
