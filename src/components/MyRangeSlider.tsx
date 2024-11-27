'use client'
import React, { useState, useRef, useEffect } from 'react';
import classes from './MyRangeSlider.module.css';
import { Tooltip } from '@mantine/core';

interface RangeSliderProps {
  initialStart?: number;
  initialEnd?: number;
  onRangeChange?: (range: number[]) => void;
}

const MyRangeSlider: React.FC<RangeSliderProps> = ({
  initialStart = 0,
  initialEnd = 0,
  onRangeChange
}) => {
  const [isDown, setIsDown] = useState(false);
  const [range, setRange] = useState([initialStart, initialEnd]);

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    if (!trackRef.current || !thumbRef.current) return;

    setIsDown(true);

    const touch = 'touches' in e ? e.touches[0] : e as React.MouseEvent;
    const rect = trackRef.current.getBoundingClientRect();
    const startX = touch.clientX - rect.left;

    startXRef.current = startX;
    currentXRef.current = startX;

    if (thumbRef.current) {
      thumbRef.current.style.left = `${startX}px`;
    }

    setRange([startX / trackRef.current.offsetWidth, startX / trackRef.current.offsetWidth]);
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDown || !trackRef.current || !thumbRef.current) return;

    const touch = 'touches' in e ? e.touches[0] : e as MouseEvent;
    const rect = trackRef.current.getBoundingClientRect();
    let currentX = touch.clientX - rect.left;

    currentX = Math.max(0, Math.min(currentX, trackRef.current.offsetWidth));
    currentXRef.current = currentX;

    if (thumbRef.current) {
      thumbRef.current.style.left = `${currentX}px`;
    }

    const newRange = [
      currentX > startXRef.current
        ? Math.round(startXRef.current * 100 / trackRef.current.offsetWidth)
        : Math.round(currentX * 100 / trackRef.current.offsetWidth),
      currentX > startXRef.current
        ? Math.round(currentX * 100 / trackRef.current.offsetWidth)
        : Math.round(startXRef.current * 100 / trackRef.current.offsetWidth)
    ];

    setRange(newRange);
    onRangeChange?.(newRange);
  };

  const handleEnd = () => {
    setIsDown(false);
  };

  useEffect(() => {
    if (isDown) {
      window.addEventListener('mousemove', handleMove as EventListener);
      window.addEventListener('touchmove', handleMove as EventListener);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchend', handleEnd);

      return () => {
        window.removeEventListener('mousemove', handleMove as EventListener);
        window.removeEventListener('touchmove', handleMove as EventListener);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDown]);

  return (
    <div className={classes.rangeSlider}>
      <div
        ref={trackRef}
        className={classes.track}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        <div
          className={classes.trackRange}
          style={{
            left: `${range[0]}%`,
            top: '0',
            width: `${range[1] - range[0]}%`,
          }}
        />
      </div>
      <Tooltip
        label={`${range[0]} - ${range[1]}`}
        color="gray"
        opened={false}
        position="top" offset={10}
      >
        <div
          ref={thumbRef}
          className={classes.thumb}
          style={{
            visibility: 'visible',
            left: `${range[1]}%`
          }}
        />
      </Tooltip>
    </div>
  );
};

export default MyRangeSlider;