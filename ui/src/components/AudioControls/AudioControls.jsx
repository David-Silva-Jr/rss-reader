import {
  Box,
  Typography,
  IconButton,
  Stack
} from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import Forward10Icon from '@mui/icons-material/Forward10';
import Replay10Icon from '@mui/icons-material/Replay10';

import './AudioControls.css'
import { useEffect, useRef, useState } from 'react';

const AudioControls = ({ title, controlsEnabled }) => {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [animationDuration, setAnimationDuration] = useState('20s');

    useEffect(() => {
        if (containerRef.current && contentRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            var contentWidth;
            if (isOverflowing) {
                contentWidth = contentRef.current.offsetWidth / 2;
            } else {
                contentWidth = contentRef.current.offsetWidth;
            }
            
            const overflows = contentWidth > containerWidth;
            setIsOverflowing(overflows);

            if (overflows) {
                // 1 second per denominator pixels
                const duration = contentWidth / 40;
                setAnimationDuration(`${duration}s`);
            }
        }
    }, [title]);

    return (
        <Stack alignItems={"center"} justifyContent={"center"} maxHeight={"100%"} height={'-webkit-fill-available'}>
            <Box maxWidth={'100%'} ref={containerRef} className="scrolling-text-container" display={"flex"}>
                <div 
                    ref={contentRef} 
                    className={`scrolling-text-content ${isOverflowing ? 'scrolling-text-animated' : ''}`}
                    style={{
                        animationDuration: animationDuration
                    }}
                >
                    <Typography component={"span"}  sx={{ paddingLeft: isOverflowing ? '2rem' : 0 }}>
                        {`${title}`}
                    </Typography>
                    { isOverflowing && 
                        <Typography component={"span"}  sx={{ paddingLeft: '2rem' }}>
                            {`${title}`}
                        </Typography> 
                    }
                </div>
            </Box>
            { controlsEnabled && (
                <Stack justifyContent={"center"} direction={"row"}>
                    <IconButton onClick={() => {console.log("Play clicked")}}>
                        <SkipPreviousIcon fontSize={"large"} />
                    </IconButton>
                    <IconButton onClick={() => {console.log("Play clicked")}}>
                        <Replay10Icon fontSize={"large"} />
                    </IconButton>
                    <IconButton onClick={() => {console.log("Play clicked")}}>
                        <PlayCircleIcon fontSize={"large"} />
                    </IconButton>
                    <IconButton onClick={() => {console.log("Play clicked")}}>
                        <Forward10Icon fontSize={"large"} />
                    </IconButton>
                    <IconButton onClick={() => {console.log("Play clicked")}}>
                        <SkipNextIcon fontSize={"large"} />
                    </IconButton>
                </Stack>
            )}
        </Stack>
    );
};

export default AudioControls;