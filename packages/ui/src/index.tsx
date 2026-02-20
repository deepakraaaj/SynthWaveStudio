import React from 'react';
import './theme.css';

export const Panel = ({ children, title, className = '' }: { children: React.ReactNode; title?: string; className?: string }) => (
    <div className={`card-premium ${className}`}>
        {title && <h3 className="panel-title">{title}</h3>}
        <div className="panel-content">
            {children}
        </div>
    </div>
);

export const Button = ({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <button className={`btn-primary ${className}`} onClick={onClick}>
        {children}
    </button>
);

export const Slider = ({ label, value, min, max, unit = '', onChange, className = '' }: { label: string; value: number; min: number; max: number; unit?: string; onChange: (val: number) => void; className?: string }) => (
    <div className={`control-group ${className}`}>
        <div className="control-header">
            <label className="control-label">{label}</label>
            <span className="control-value">{value.toFixed(2)}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={(max - min) / 100}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="slider-input"
        />
    </div>
);

export const Select = ({ label, value, options, onChange, className = '' }: { label: string; value: string; options: { label: string; value: string }[]; onChange: (val: string) => void; className?: string }) => (
    <div className={`control-group ${className}`}>
        <label className="control-label">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="select-input">
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export const PianoKey = ({ note, isBlack, isActive, onPlay, onStop, className = '', showLabel = true, shortcutLabel, style }: { note: string; isBlack: boolean; isActive?: boolean; onPlay: () => void; onStop: () => void; className?: string; showLabel?: boolean; shortcutLabel?: string; style?: React.CSSProperties }) => (
    <div
        className={`piano-key ${isBlack ? 'black-key' : 'white-key'} ${isActive ? 'active' : ''} ${className}`}
        style={style}
        onMouseDown={onPlay}
        onMouseUp={onStop}
        onMouseLeave={onStop}
        onTouchStart={(e) => { e.preventDefault(); onPlay(); }}
        onTouchEnd={onStop}
        title={note}
    >
        {(showLabel || shortcutLabel) && (
            <span className="key-label-wrap">
                {shortcutLabel && <span className="key-shortcut">{shortcutLabel}</span>}
                {showLabel && <span className="key-label">{note}</span>}
            </span>
        )}
    </div>
);
