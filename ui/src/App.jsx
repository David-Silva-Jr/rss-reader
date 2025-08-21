import { useState, useEffect } from 'react'
import {
  Box,
  Grid
} from '@mui/material';

import PodcastCard from './components/PodcastCard/PodcastCard';

import './App.css'

function App() {
  const [podcastData, setPodcastData] = useState([]);
  useEffect(() => {
    fetchPodcasts();
  }, []);
  const [expiryDays, setExpiryDays] = useState(5); // Default to 30
  useEffect(() => {
    getExpiryDate();
  });

  const fetchPodcasts = async () => {
    try {
      const output = await window.api.runPythonScript('get_all_episodes', []);
      setPodcastData(output);
    } catch (error) {
      console.error("error fetching podcasts: ", error);
    }
  }

  const getExpiryDate = async () => {
    const lifetime = await window.api.runPythonScript('get_config', [ 'expire_time' ]);
    setExpiryDays(lifetime.value);
  }

  return (
    <Box sx={{
      p: 3,
      bgcolor: "#f5f5f5",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <Grid container spacing={4} justifyContent={"center"}>
        {podcastData.map(item =>
          <Grid key={item.uid}>
            <PodcastCard podcast={item} onKeepChange={fetchPodcasts} expiryDays={expiryDays}/>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default App
