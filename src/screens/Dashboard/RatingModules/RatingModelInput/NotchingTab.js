import React, { useEffect, useState } from 'react'
import PropTypes from "prop-types";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import NotchingTemplate from './NotchingTemplate';
import { Switch, Typography } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <>{children}</>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function NotchingTab(props) {
  const { risk, index, updateNotchingFactor, notchingMaster, handleMainTabChange } = props;
  const [value, setValue] = React.useState(0);

  const [params, setParams] = useState({
    is_active: true,
  });

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleChange = (newValue) => {
    console.log(newValue);
    if(newValue >= 0 && newValue <=notchingMaster.length -1){
      setValue(newValue);
    }else{
      let mainTabIndex = index
      mainTabIndex = (newValue < 0) ? mainTabIndex-1 : mainTabIndex+1;
      handleMainTabChange(mainTabIndex)
    }
  };
  useEffect(() => {

  }, [value]);

  const updateParams = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleTabChange}
          className="notching-tabs">
          {notchingMaster.map((notcheingType, key) => {
            return <Tab label={notcheingType.name} className="notching-tab-inner" key={key + 1} {...a11yProps(key)} />
          })}
        </Tabs>
      </Box>
      {notchingMaster.map((notcheingType, key) => {
        return <TabPanel value={value} key={key + 1} index={key}>
          <Box sx={{ float: "right", display: "flex", padding: "5px 0" }}>
            <Typography sx={{ padding: "0  15px" }}>If Project</Typography>
            <Typography>
              <Switch
                name="is_active"
                checked={params["is_active"]}
                onChange={(e) => updateParams("is_active", e.target.checked)}
              />
              {params["is_active"] ? "  Yes" : "  No"}
            </Typography>
          </Box>
          <NotchingTemplate risk={notcheingType} index={index} notchingKey={key} notchingIndex={key} handleChange={handleChange} updateNotchingFactor={updateNotchingFactor} />
        </TabPanel>
      })}
    </Box>
  );
}

NotchingTab.propTypes = {
  risk: PropTypes.any.isRequired,
  index: PropTypes.any.isRequired,
  updateNotchingFactor: PropTypes.any.isRequired,
  notchingMaster: PropTypes.any.isRequired,
  handleMainTabChange: PropTypes.any.isRequired,
};
export default NotchingTab;