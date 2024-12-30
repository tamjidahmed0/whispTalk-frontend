'use client'
import { Icon } from '@iconify/react';
import React, { useMemo, useRef, useCallback } from 'react';
import { useWavesurfer } from '@wavesurfer/react';


const VoiceMessage = ({ audioUrl, waveColor, progressColor }) => {
  const containerRef = useRef(null);

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    height: 50,
    width:80,
    waveColor,
    progressColor,
    url: audioUrl,
    barWidth: 4,
    // Optionally, specify the spacing between bars
    barGap: 3,
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
          {isPlaying ? 
          
          <Icon icon="ic:baseline-pause" width="24" height="24" color = {waveColor}/>
          
          :  <Icon icon="ic:baseline-play-arrow" width="24" height="24" color = {waveColor} />}
        </button>
      </div>


      {/* Waveform container */}
     <div >
     <div ref={containerRef}  />
     </div>

      {/* Audio Information */}
     
      <p style={{ color: waveColor }}>{formatTime(currentTime)}</p>

   
    </div>
  );
};

export default VoiceMessage;
