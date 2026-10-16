import { mount } from '@vue/test-utils';
import HomePage from '@/views/HomePage.vue';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import * as weatherService from '@/services/weatherService';

describe('HomePage.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('renders page title and initial structure', () => {
    vi.spyOn(weatherService, 'fetchWeatherForecast').mockResolvedValue({
      latitude: -6.2,
      longitude: 106.8,
      timezone: 'GMT',
      elevation: 15,
      temperatureUnit: '°C',
      items: [
        {
          time: '2026-10-16T00:00',
          temperature_2m: 26.5,
          formattedDate: 'Jum, 16 Okt 2026',
          formattedTime: '00:00',
        },
      ],
    });

    const wrapper = mount(HomePage);
    expect(wrapper.text()).toContain('Cuaca Jakarta');
    expect(wrapper.text()).toContain('DKI Jakarta');
  });

  test('formatDate helper returns formatted date and time', () => {
    const { formattedDate, formattedTime } = weatherService.formatDate('2026-10-16T14:00');
    expect(formattedDate).toBeTruthy();
    expect(formattedTime).toBe('14.00'); // ID locale uses . or : depending on node version
  });
});
