import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack
} from '@mui/material';

import { useState } from 'react';

const PodcastCard = ({ podcast, onKeepChange, expiryDays, onCardSelected }) => {
const [downloading, setDownloading] = useState(false);

const publishDate = new Date(podcast.release_date);
const formattedDate = new Date(publishDate).toLocaleDateString(
    'en-US', { year: 'numeric', month: 'long', day: 'numeric' }
);

const expiryDate = new Date(publishDate);
expiryDate.setDate(publishDate.getDate() + expiryDays);
const formattedExpiryDate = expiryDate.toLocaleDateString(
    'en-US', { year: 'numeric', month: 'long', day: 'numeric' }
);

const handleKeepClick = async (event) => {
    event.stopPropagation();
    console.log(`Keep button clicked for podcast with UID: ${podcast.uid}`);
    const newKeepValue = podcast.keep === 0 ? 'True' : 'False';
    await window.api.runPythonScript('set_keep', [ podcast.uid, newKeepValue ]);
    onKeepChange();
};

const handleDownloadClick = async (event) => {
    event.stopPropagation();
    console.log(`Keep button clicked for podcast with UID: ${podcast.uid}`);
    setDownloading(true);
    await window.api.runPythonScript('download', [ podcast.uid ]);
    await onKeepChange();
    setDownloading(false);
}

const handleCardClick = () => {
    onCardSelected(podcast);
}

return (
    <Card sx={{
    minWidth: 300,
    minHeight: 'fit-content',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    '&:hover': {
        transform: 'scale(1.02)'
    }
    }}>
        <CardContent onClick={handleCardClick}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Chip
                    label={podcast.feed}
                    size="small"
                    sx={{
                    backgroundColor: '#e0e0e0',
                    color: '#333',
                    fontWeight: 'bold',
                    borderRadius: '8px'
                    }}
                />
                <Stack direction="row" spacing={1}>
                    {podcast.downloaded === 0 && !downloading && (
                        <Chip
                            label="Download?"
                            size="small"
                            onClick={handleDownloadClick}
                            sx={{
                            backgroundColor: "#e0e0e0",
                            color: "#333",
                            borderRadius: "8px"
                            }}
                        />
                    )}
                    {podcast.downloaded === 0 && downloading && (
                        <Chip
                            label="Downloading..."
                            size="small"
                            sx={{
                            backgroundColor: "#e0e0e0",
                            color: "#333",
                            borderRadius: "8px"
                            }}
                        />
                    )}
                    {podcast.downloaded === 1 && (
                        <Chip
                            label="Downloaded"
                            size="small"
                            sx={{
                            backgroundColor: "#e0e0e0",
                            color: "#333",
                            borderRadius: "8px"
                            }}
                        />
                    )}
                    {podcast.keep === 0 && (
                        <Chip
                            label="Keep?"
                            size="small"
                            onClick={handleKeepClick}
                            sx={{
                            backgroundColor: "#e0e0e0",
                            color: "#333",
                            borderRadius: "8px"
                            }}
                        />
                    )}
                    {podcast.keep === 1 && (
                        <Chip
                            label="Kept"
                            size="small"
                            onClick={handleKeepClick}
                            sx={{
                            backgroundColor: "#c0ffc0",
                            color: "#333",
                            borderRadius: "8px"
                            }}
                        />
                    )}
                </Stack>
            </Box>

            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                {podcast.title}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: "100%" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Published: {formattedDate}
            </Typography>
            {podcast.keep === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Expires on {formattedExpiryDate}
                </Typography>
            )}
            </Box>
        </CardContent>
    </Card>
);
};

export default PodcastCard;