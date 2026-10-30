import { GenerationSettings } from '../types';

export interface RunwayTaskResponse {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  createdAt?: string;
  output?: string[];
  failure?: string;
  failureCode?: string;
  progress?: number;
}

export interface PromptEnhanceResult {
  enhancedPrompt: string;
  cameraMovement: string;
  lightingStyle: string;
  cinematicMood: string;
}

export class AiApiService {
  /**
   * Refines a user's basic prompt into a professional-grade Hollywood / Runway director prompt.
   */
  static enhancePrompt(rawPrompt: string, style: string, motion: string): PromptEnhanceResult {
    const p = rawPrompt.trim();
    if (!p) {
      return {
        enhancedPrompt: 'Cinematic atmospheric establishing shot with golden hour natural lighting and rich volumetric depth.',
        cameraMovement: 'Slow dolly-in with smooth 35mm optical stabilization',
        lightingStyle: 'Chiaroscuro contrast with warm practical rim lights',
        cinematicMood: 'Epic, contemplative and visually arresting',
      };
    }

    const styleDescriptors: Record<string, string> = {
      'cinematic-film': 'Shot on ARRI Alexa LF, Master Anamorphic 50mm T1.9 lens, Kodak Vision3 500T film grain, shallow depth of field, natural motion blur, authentic color grading',
      'hyper-realism': 'Unreal Engine 5.4 cinematic render, ray-traced subsurface scattering, 8K ultra-detailed textures, volumetric god rays, hyper-crisp focus',
      'anime-cel': 'Studio MAPPA aesthetic, hand-drawn keyframe animation, fluid sakuga motion, dramatic high-contrast ink lines, saturated twilight palette',
      'cyberpunk-neon': 'Neo-Tokyo rainy night, vibrant neon pink and cyan specular reflections, wet asphalt bokeh, chromatic aberration, holographic steam',
      'vintage-35mm': '1970s Panavision anamorphic lens, warm vintage halogen glow, organic gate weave, rich warm earth tones, nostalgic soft bloom',
      'dreamy-fantasy': 'Ethereal bioluminescent ambient glow, floating particulate embers, pastel mist, enchanted celestial atmosphere, surreal poetic realism',
      '3d-render': 'Octane render, Pixar production aesthetic, tactile clay and cloth textures, physical studio bounce lighting, polished keyframe dynamics',
    };

    const motionDescriptors: Record<string, string> = {
      'dolly-zoom': 'Vertigo effect: lens focal length rapidly expanding while camera pulls back smoothly, shifting spatial depth',
      'drone-aerial': 'Low-altitude drone sweep gliding forward into an expansive dramatic horizon reveal, smooth 3-axis gimbal',
      'orbital-pan': 'Circular 360-degree rotational pan tracking the subject with dynamic parallax background separation',
      'slow-particles': 'High-frame-rate 120fps slow-motion capture, suspended dust motes and micro-droplets drifting in air currents',
      'hyperlapse-blur': 'Kinetic hyper-lapse with long-exposure speed streaks, temporal compression, and fluid forward momentum',
      'cinematic-parallax': 'Measured lateral tracking shot showing layered multi-plane depth and environmental parallax',
    };

    const extraStyle = styleDescriptors[style] || styleDescriptors['cinematic-film'];
    const extraMotion = motionDescriptors[motion] || motionDescriptors['cinematic-parallax'];

    const enhanced = `${p}, ${extraStyle}. ${extraMotion}. Professional colorist grade, 24fps motion cadence, master composition.`;

    return {
      enhancedPrompt: enhanced,
      cameraMovement: extraMotion,
      lightingStyle: style.includes('neon') ? 'Cyberpunk neon rim & specular bounce' : 'Naturalistic volumetric lighting',
      cinematicMood: 'High production value cinematic showcase',
    };
  }

  /**
   * Submits a generation task to the official Runway Gen-3 API
   */
  static async submitRunwayJob(
    apiKey: string,
    settings: GenerationSettings
  ): Promise<string> {
    if (!apiKey) throw new Error('Runway API key is required');

    // Runway Gen-3 API parameters
    const body: Record<string, unknown> = {
      promptText: settings.prompt,
      model: 'gen3a_turbo',
      duration: settings.duration <= 5 ? 5 : 10,
      ratio: settings.aspectRatio === '9:16' ? '768:1280' : '1280:768',
    };

    if (settings.imageSource?.dataUrl) {
      body.promptImage = settings.imageSource.dataUrl;
    }

    const response = await fetch('https://api.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-09-13',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Runway API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * Polls Runway API task status
   */
  static async pollRunwayJob(
    apiKey: string,
    taskId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const maxAttempts = 60;
    const intervalMs = 2500;

    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-09-13',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check task status: ${response.statusText}`);
      }

      const task: RunwayTaskResponse = await response.json();
      if (onProgress && task.progress) {
        onProgress(Math.round(task.progress * 100));
      }

      if (task.status === 'SUCCEEDED' && task.output && task.output.length > 0) {
        return task.output[0];
      }

      if (task.status === 'FAILED' || task.status === 'CANCELLED') {
        throw new Error(task.failure || 'Runway video generation task failed.');
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }

    throw new Error('Runway generation timed out. Please check your Runway dashboard.');
  }

  /**
   * Test OpenAI API key connection
   */
  static async testOpenAiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
    if (!apiKey) return { success: false, message: 'Please provide an API key' };
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) {
        return { success: true, message: 'OpenAI API key validated successfully!' };
      }
      return { success: false, message: `Validation failed: HTTP ${res.status}` };
    } catch (e: unknown) {
      return { success: false, message: e instanceof Error ? e.message : 'Network error testing OpenAI key' };
    }
  }

  /**
   * Test Runway API key connection
   */
  static async testRunwayKey(apiKey: string): Promise<{ success: boolean; message: string }> {
    if (!apiKey) return { success: false, message: 'Please provide a Runway key' };
    try {
      const res = await fetch('https://api.runwayml.com/v1/tasks', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-09-13',
        },
      });
      if (res.status === 200 || res.status === 404) {
        return { success: true, message: 'Runway API credentials connected!' };
      }
      return { success: false, message: `Runway responded with status ${res.status}` };
    } catch (e: unknown) {
      return { success: false, message: e instanceof Error ? e.message : 'Network error testing Runway key' };
    }
  }
}
