'use client'

import React, { useMemo, useRef, useCallback } from 'react';
import { useWavesurfer } from '@wavesurfer/react';


const AudioWaveform = ({ audioUrl }) => {
  const containerRef = useRef(null);

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    height: 80,
    width:200,
    waveColor: 'rgb(200, 0, 200)',
    progressColor: 'rgb(100, 0, 100)',
    url: audioUrl,
    barWidth: 2,
    // Optionally, specify the spacing between bars
    barGap: 1,
    // And the bar radius
    barRadius: 2,
 
  });

  const onPlayPause = useCallback(() => {
    if (wavesurfer) {
      wavesurfer.playPause();
    }
  }, [wavesurfer]);

  const formatTime = (seconds) => {
    return [Math.floor(seconds / 60), seconds % 60]
      .map((v) => `0${Math.floor(v)}`.slice(-2))
      .join(':');
  };

  if (!audioUrl) {
    return <p>No audio available to play.</p>;
  }

  return (
    <div className = 'flex items-center gap-3'>

   {/* Controls */}
   <div >
        <button onClick={onPlayPause} >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>


      {/* Waveform container */}
     <div >
     <div ref={containerRef}  />
     </div>

      {/* Audio Information */}
     
      <p>{formatTime(currentTime)}</p>

   
    </div>
  );
};

export default AudioWaveform;
