import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Divider,
  Grid,
  Stack,
  Typography
} from '@mui/material';

import PodcastCard from './components/PodcastCard/PodcastCard';

import './App.css'
import AudioControls from './components/AudioControls/AudioControls';

function App() {
  const [podcastData, setPodcastData] = useState([]);
  useEffect(() => {
    fetchPodcasts();
  }, []);

  const [expiryDays, setExpiryDays] = useState(5); // Default to 30
  useEffect(() => {
    getExpiryDate();
  }, []);

  const [selectedPodcast, setSelectedPodcast] = useState('');
  const [podcastSummary, setPodcastSummary] = useState('');
  useEffect(() => {
    getSummary(selectedPodcast.uid);
  }, [selectedPodcast]);

  const fetchPodcasts = async () => {
    try {
      const output = await window.api.runPythonScript('get_all_episodes', []);
      setPodcastData(output);
    } catch (error) {
      console.error("error fetching podcasts: ", error);
    }
  }

  const getExpiryDate = async () => {
    const lifetime = await window.api.runPythonScript('get_config', ['expire_time']);
    setExpiryDays(lifetime.value);
  }

  const getSummary = async (uid) => {
    const response = await window.api.runPythonScript('get_summary', [uid])
    console.log(response)
    setPodcastSummary(response[0]['summary'])
  }

  return (

    <>
      <Box sx={{
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
        maxHeight: "100vh",
        minWidth: "100%",
        maxWidth: "100%",
        display: "flex"
      }}>
        <Grid container width={'100%'} maxHeight={'100vh'}>
          <Grid height={'100%'} size={6}>
            <Stack maxHeight={'100vh'}>
              <Box maxWidth='100%' padding={2} flex={1} sx={{overflowY: "auto", overflowX: "hidden"}}>
                <Stack spacing={2}>
                  {podcastData.map(item =>
                    <PodcastCard 
                      key={item.uid} 
                      podcast={item} 
                      onKeepChange={fetchPodcasts} 
                      onCardSelected={setSelectedPodcast}
                      expiryDays={expiryDays} 
                    />
                  )}
                </Stack>
              </Box>
              <Box sx={{
                width: "100%",
                height: "10vh",
                backgroundColor: "#6688ff"
              }}>
                <Grid container height={"100%"}>
                  <Grid size={4}>
                    <AudioControls 
                      title={selectedPodcast.title} 
                      controlsEnabled={selectedPodcast.downloaded === 1} 
                    />
                  </Grid>
                  <Grid container padding={2} display={"flex"} height={"100%"} alignItems={"center"} size={8}>
                    <Stack width='100%' justifyContent={'space-evenly'} direction={"row"}>
                      <Button variant='contained'>
                        Button1
                      </Button>
                      <Button variant='contained'>
                        Button2
                      </Button>
                      <Button variant='contained'>
                        Button3
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Grid>
          <Grid maxHeight={'100%'} size={6}>
              <Box maxHeight={'100%'} padding={1} boxSizing={'border-box'} flex={1} sx={{overflowY: "auto"}}>
                <div dangerouslySetInnerHTML={{__html: podcastSummary}} />
              </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default App
