import * as Tone from 'tone';

export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type InstrumentStyle = 'default' | 'flute';

export interface ADSREnvelope {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
}

export class SoundAnalyzer {
    private fft: Tone.FFT;

    constructor() {
        this.fft = new Tone.FFT(2048);
    }

    getFFT() {
        return this.fft;
    }

    getFrequencyData() {
        return this.fft.getValue();
    }

    dispose() {
        this.fft.dispose();
    }
}

export class Synthesizer {
    private polySynth: Tone.PolySynth;
    private analyzer: SoundAnalyzer;
    private volume: Tone.Volume;
    private filter: Tone.Filter;
    private vibrato: Tone.Vibrato;
    private reverb: Tone.Freeverb | null;

    constructor() {
        this.volume = new Tone.Volume(-12).toDestination();
        this.filter = new Tone.Filter(12000, 'lowpass');
        this.vibrato = new Tone.Vibrato(5.5, 0);
        this.reverb = null;
        try {
            const isSecure = typeof globalThis !== 'undefined'
                && (typeof globalThis.isSecureContext === 'undefined' || globalThis.isSecureContext);
            if (isSecure) {
                this.reverb = new Tone.Freeverb(0.2, 2800);
                this.reverb.wet.value = 0.03;
            }
        } catch {
            // Freeverb can fail in non-secure contexts where AudioWorklet is unavailable.
            this.reverb = null;
        }

        this.polySynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 0.1,
                decay: 0.2,
                sustain: 0.5,
                release: 1
            }
        });

        if (this.reverb) {
            this.polySynth.chain(this.filter, this.vibrato, this.reverb, this.volume);
        } else {
            this.polySynth.chain(this.filter, this.vibrato, this.volume);
        }

        this.analyzer = new SoundAnalyzer();
        this.volume.connect(this.analyzer.getFFT());
        this.setInstrumentStyle('default');
    }

    setWaveform(type: WaveformType) {
        this.polySynth.set({
            oscillator: { type }
        });
    }

    setEnvelope(envelope: Partial<ADSREnvelope>) {
        this.polySynth.set({
            envelope
        });
    }

    setVolume(value: number) {
        this.volume.volume.value = value;
    }

    setInstrumentStyle(style: InstrumentStyle) {
        if (style === 'flute') {
            this.filter.frequency.rampTo(2900, 0.05);
            this.filter.Q.rampTo(2.6, 0.05);
            this.vibrato.frequency.rampTo(5.4, 0.1);
            this.vibrato.depth.rampTo(0.09, 0.1);
            if (this.reverb) {
                this.reverb.roomSize.rampTo(0.3, 0.1);
                this.reverb.dampening = 2600;
                this.reverb.wet.rampTo(0.12, 0.1);
            }
            return;
        }

        this.filter.frequency.rampTo(12000, 0.08);
        this.filter.Q.rampTo(0.3, 0.08);
        this.vibrato.depth.rampTo(0, 0.08);
        if (this.reverb) {
            this.reverb.roomSize.rampTo(0.2, 0.08);
            this.reverb.dampening = 2800;
            this.reverb.wet.rampTo(0.03, 0.08);
        }
    }

    triggerAttack(note: string | string[], velocity = 0.85) {
        if (Tone.getContext().state !== 'running') {
            Tone.start();
        }
        this.polySynth.triggerAttack(note, undefined, velocity);
    }

    triggerRelease(note: string | string[]) {
        this.polySynth.triggerRelease(note);
    }

    resume() {
        if (Tone.getContext().state !== 'running') {
            Tone.getContext().resume();
        }
    }

    getAnalyzer() {
        return this.analyzer;
    }

    dispose() {
        this.polySynth.releaseAll();
        this.polySynth.dispose();
        this.filter.dispose();
        this.vibrato.dispose();
        this.reverb?.dispose();
        this.volume.dispose();
        this.analyzer.dispose();
    }
}

export const engine = {
    Synthesizer,
    SoundAnalyzer,
    Tone
};
