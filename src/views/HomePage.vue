<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-title>Cuaca Jakarta</ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="loading" aria-label="Segarkan data" @click="loadWeather">
            <ion-icon slot="icon-only" :icon="refreshOutline" :class="{ 'spin-animation': loading }" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content pulling-text="Tarik untuk memperbarui..." refreshing-spinner="crescent" />
      </ion-refresher>

      <!-- Header Info & Location Card -->
      <ion-card class="hero-card">
        <ion-card-header>
          <div class="hero-header-row">
            <ion-badge color="light" class="location-badge">
              <ion-icon :icon="locationOutline" />
              <span>DKI Jakarta, Indonesia</span>
            </ion-badge>
            <ion-badge color="tertiary" class="api-badge">Open-Meteo API</ion-badge>
          </div>
          <ion-card-title class="hero-title">Prakiraan Suhu Per Jam</ion-card-title>
          <ion-card-subtitle class="hero-subtitle">
            Koordinat: Lat -6.2, Long 106.8 • Elevasi: {{ forecastData?.elevation ?? 15 }} mdpl
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content v-if="summary && !loading">
          <ion-grid class="summary-grid">
            <ion-row>
              <ion-col size="6" size-md="3">
                <div class="metric-box">
                  <div class="metric-label">
                    <ion-icon :icon="thermometerOutline" />
                    <span>Suhu Terbaru</span>
                  </div>
                  <div class="metric-value current">{{ summary.currentTemp }} {{ forecastData?.temperatureUnit }}</div>
                  <div class="metric-sub">{{ summary.currentTime }}</div>
                </div>
              </ion-col>
              <ion-col size="6" size-md="3">
                <div class="metric-box">
                  <div class="metric-label">
                    <ion-icon :icon="arrowDownOutline" />
                    <span>Terendah</span>
                  </div>
                  <div class="metric-value min">{{ summary.minTemp }} {{ forecastData?.temperatureUnit }}</div>
                  <div class="metric-sub">Suhu minimum</div>
                </div>
              </ion-col>
              <ion-col size="6" size-md="3">
                <div class="metric-box">
                  <div class="metric-label">
                    <ion-icon :icon="arrowUpOutline" />
                    <span>Tertinggi</span>
                  </div>
                  <div class="metric-value max">{{ summary.maxTemp }} {{ forecastData?.temperatureUnit }}</div>
                  <div class="metric-sub">Suhu maksimum</div>
                </div>
              </ion-col>
              <ion-col size="6" size-md="3">
                <div class="metric-box">
                  <div class="metric-label">
                    <ion-icon :icon="cloudOutline" />
                    <span>Total Sampel</span>
                  </div>
                  <div class="metric-value count">{{ forecastData?.items.length ?? 0 }}</div>
                  <div class="metric-sub">titik jam (7 hari)</div>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <!-- Error State -->
      <ion-card v-if="errorMessage && !loading" color="danger" class="error-card">
        <ion-card-header>
          <div class="error-header">
            <ion-icon :icon="alertCircleOutline" class="error-icon" />
            <ion-card-title>Terjadi Kendala</ion-card-title>
          </div>
        </ion-card-header>
        <ion-card-content>
          <p>{{ errorMessage }}</p>
          <ion-button color="light" fill="solid" size="small" class="ion-margin-top" @click="loadWeather">
            <ion-icon slot="start" :icon="refreshOutline" />
            Coba Lagi
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Loading State Skeleton -->
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent" color="primary" class="main-spinner" />
        <p class="loading-text">Mengambil data cuaca Jakarta dari Open-Meteo...</p>
      </div>

      <!-- Controls: View Mode & Search Filter -->
      <div v-if="!loading && forecastData" class="controls-section">
        <ion-segment v-model="viewMode" class="view-segment">
          <ion-segment-button value="list">
            <ion-icon :icon="listOutline" />
            <ion-label>Tampilan List</ion-label>
          </ion-segment-button>
          <ion-segment-button value="table">
            <ion-icon :icon="gridOutline" />
            <ion-label>Tampilan Tabel</ion-label>
          </ion-segment-button>
        </ion-segment>

        <ion-searchbar
          v-model="searchQuery"
          placeholder="Cari tanggal atau jam (cth: 2026-10-16 atau 14:00)..."
          class="custom-searchbar"
          :debounce="150"
        />

        <div class="results-meta">
          <span class="meta-label">
            Menampilkan <strong>{{ filteredItems.length }}</strong> dari {{ forecastData.items.length }} data per jam
          </span>
          <span class="field-badge">
            Atribut: <code>time</code> & <code>temperature_2m</code>
          </span>
        </div>
      </div>

      <!-- VIEW MODE 1: LIST VIEW -->
      <div v-if="!loading && forecastData && viewMode === 'list'" class="weather-list-container">
        <div v-if="filteredItems.length === 0" class="empty-state">
          <ion-icon :icon="cloudOutline" class="empty-icon" />
          <p>Tidak ada data cuaca yang sesuai dengan pencarian "{{ searchQuery }}".</p>
        </div>

        <ion-list v-else :inset="true" class="weather-list">
          <ion-item v-for="(item, index) in filteredItems" :key="item.time" class="weather-item">
            <div slot="start" class="index-indicator">
              #{{ index + 1 }}
            </div>

            <ion-label class="item-content">
              <div class="item-primary-row">
                <div class="item-time-info">
                  <div class="date-text">
                    <ion-icon :icon="calendarOutline" class="inline-icon" />
                    <span>{{ item.formattedDate }}</span>
                  </div>
                  <div class="time-text">
                    <ion-icon :icon="timeOutline" class="inline-icon" />
                    <span class="hour-highlight">{{ item.formattedTime }} WIB</span>
                  </div>
                </div>

                <div class="item-temp-badge" :class="getTempClass(item.temperature_2m)">
                  <ion-icon :icon="thermometerOutline" />
                  <span class="temp-number">{{ item.temperature_2m.toFixed(1) }}</span>
                  <span class="temp-unit">°C</span>
                </div>
              </div>

              <!-- Raw field attribute display (time & temperature_2m) -->
              <div class="raw-field-row">
                <span class="raw-pill time-pill">
                  <strong>time:</strong> {{ item.time }}
                </span>
                <span class="raw-pill temp-pill">
                  <strong>temperature_2m:</strong> {{ item.temperature_2m }}°C
                </span>
              </div>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- VIEW MODE 2: TABLE VIEW -->
      <div v-if="!loading && forecastData && viewMode === 'table'" class="table-container">
        <div v-if="filteredItems.length === 0" class="empty-state">
          <ion-icon :icon="cloudOutline" class="empty-icon" />
          <p>Tidak ada data cuaca yang sesuai dengan pencarian "{{ searchQuery }}".</p>
        </div>

        <div v-else class="table-responsive">
          <table class="weather-table">
            <thead>
              <tr>
                <th class="th-num">No</th>
                <th class="th-time">Waktu Pengukuran (<code>time</code>)</th>
                <th class="th-temp">Suhu (<code>temperature_2m</code>)</th>
                <th class="th-condition">Kategori Suhu</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, idx) in filteredItems"
                :key="item.time"
                :class="{ 'table-row-alt': idx % 2 === 1 }"
              >
                <td class="td-num">{{ idx + 1 }}</td>
                <td class="td-time">
                  <div class="td-time-formatted">
                    <strong>{{ item.formattedDate }}</strong> • {{ item.formattedTime }} WIB
                  </div>
                  <div class="td-time-raw">
                    <code>{{ item.time }}</code>
                  </div>
                </td>
                <td class="td-temp">
                  <span class="table-temp-pill" :class="getTempClass(item.temperature_2m)">
                    {{ item.temperature_2m.toFixed(1) }} °C
                  </span>
                </td>
                <td class="td-condition">
                  <ion-badge :color="getTempBadgeColor(item.temperature_2m)" class="status-badge">
                    {{ getTempLabel(item.temperature_2m) }}
                  </ion-badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonBadge,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonSearchbar,
} from '@ionic/vue';
import {
  thermometerOutline,
  timeOutline,
  calendarOutline,
  refreshOutline,
  locationOutline,
  cloudOutline,
  alertCircleOutline,
  listOutline,
  gridOutline,
  arrowDownOutline,
  arrowUpOutline,
} from 'ionicons/icons';

import type { WeatherForecastData, HourlyWeatherItem } from '@/types/weather';
import { fetchWeatherForecast } from '@/services/weatherService';

const forecastData = ref<WeatherForecastData | null>(null);
const loading = ref<boolean>(false);
const errorMessage = ref<string | null>(null);
const viewMode = ref<'list' | 'table'>('list');
const searchQuery = ref<string>('');

const loadWeather = async () => {
  loading.value = true;
  errorMessage.value = null;

  try {
    const data = await fetchWeatherForecast();
    forecastData.value = data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value = 'Terjadi kesalahan saat memuat data cuaca.';
    }
  } finally {
    loading.value = false;
  }
};

const handleRefresh = async (event: CustomEvent) => {
  await loadWeather();
  (event.target as HTMLIonRefresherElement).complete();
};

const filteredItems = computed<HourlyWeatherItem[]>(() => {
  if (!forecastData.value) return [];
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return forecastData.value.items;

  return forecastData.value.items.filter((item) => {
    return (
      item.time.toLowerCase().includes(query) ||
      item.formattedDate.toLowerCase().includes(query) ||
      item.formattedTime.toLowerCase().includes(query) ||
      item.temperature_2m.toString().includes(query)
    );
  });
});

const summary = computed(() => {
  if (!forecastData.value || forecastData.value.items.length === 0) return null;
  const items = forecastData.value.items;
  const temps = items.map((i) => i.temperature_2m);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const currentItem = items[0];

  return {
    currentTemp: currentItem.temperature_2m.toFixed(1),
    currentTime: `${currentItem.formattedDate} ${currentItem.formattedTime}`,
    minTemp: minTemp.toFixed(1),
    maxTemp: maxTemp.toFixed(1),
  };
});

const getTempClass = (temp: number): string => {
  if (temp < 26) return 'temp-cool';
  if (temp <= 31) return 'temp-moderate';
  return 'temp-warm';
};

const getTempBadgeColor = (temp: number): string => {
  if (temp < 26) return 'primary';
  if (temp <= 31) return 'warning';
  return 'danger';
};

const getTempLabel = (temp: number): string => {
  if (temp < 25) return 'Sejuk';
  if (temp < 28) return 'Normal';
  if (temp <= 31) return 'Hangat';
  return 'Panas';
};

onMounted(() => {
  loadWeather();
});
</script>

<style scoped>
.spin-animation {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.hero-card {
  margin: 0 0 16px 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #1f3b73 0%, #0d5c9c 50%, #0284c7 100%);
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(2, 132, 199, 0.25);
}

.hero-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 6px;
}

.location-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
}

.api-badge {
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}

.hero-title {
  color: #ffffff;
  font-size: 22px;
  font-weight: 700;
  margin: 6px 0 4px 0;
}

.hero-subtitle {
  color: #e0f2fe;
  font-size: 13px;
}

.summary-grid {
  padding: 0;
}

.metric-box {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.metric-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  text-transform: uppercase;
  color: #e0f2fe;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  margin: 4px 0 2px 0;
  color: #ffffff;
}

.metric-sub {
  font-size: 11px;
  color: #bae6fd;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
}

.main-spinner {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 15px;
  color: var(--ion-color-medium);
}

.error-card {
  border-radius: 12px;
  margin-bottom: 16px;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 24px;
}

.controls-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.view-segment {
  border-radius: 10px;
}

.custom-searchbar {
  --border-radius: 10px;
  padding: 0;
}

.results-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 4px;
  font-size: 13px;
  color: var(--ion-color-medium);
}

.field-badge {
  background: var(--ion-color-step-100, #f1f5f9);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--ion-color-dark);
}

.field-badge code {
  color: var(--ion-color-primary);
  font-weight: 700;
}

/* List View Styles */
.weather-list {
  background: transparent;
  padding: 0;
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.weather-item {
  --padding-start: 12px;
  --padding-end: 12px;
  --inner-padding-end: 8px;
  --border-color: var(--ion-color-step-150, #e2e8f0);
}

.index-indicator {
  font-size: 12px;
  font-weight: 700;
  color: var(--ion-color-medium);
  min-width: 32px;
}

.item-content {
  padding: 10px 0;
}

.item-primary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-time-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-text {
  font-size: 12px;
  color: var(--ion-color-medium);
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--ion-color-dark);
  display: flex;
  align-items: center;
  gap: 4px;
}

.hour-highlight {
  font-weight: 700;
}

.inline-icon {
  font-size: 14px;
}

.item-temp-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
}

.temp-number {
  font-size: 18px;
}

.temp-unit {
  font-size: 13px;
}

.temp-cool {
  background-color: #e0f2fe;
  color: #0369a1;
}

.temp-moderate {
  background-color: #fef3c7;
  color: #b45309;
}

.temp-warm {
  background-color: #fee2e2;
  color: #b91c1c;
}

.raw-field-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.raw-pill {
  font-size: 11px;
  background: var(--ion-color-step-100, #f1f5f9);
  color: var(--ion-color-step-700, #334155);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
}

/* Table View Styles */
.table-container {
  background: var(--ion-card-background, #ffffff);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--ion-color-step-150, #e2e8f0);
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.weather-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.weather-table th {
  background: var(--ion-color-step-100, #f8fafc);
  color: var(--ion-color-dark);
  font-weight: 600;
  padding: 12px 14px;
  border-bottom: 2px solid var(--ion-color-step-200, #e2e8f0);
  white-space: nowrap;
}

.weather-table th code {
  color: var(--ion-color-primary);
  font-size: 12px;
}

.weather-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--ion-color-step-150, #f1f5f9);
  vertical-align: middle;
}

.table-row-alt {
  background: var(--ion-color-step-50, #fdfdfd);
}

.td-num {
  font-weight: 600;
  color: var(--ion-color-medium);
  width: 45px;
}

.td-time-formatted {
  color: var(--ion-color-dark);
  margin-bottom: 3px;
}

.td-time-raw code {
  font-size: 11px;
  color: var(--ion-color-medium);
  background: var(--ion-color-step-100, #f1f5f9);
  padding: 2px 6px;
  border-radius: 4px;
}

.table-temp-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
}

.status-badge {
  font-weight: 600;
  font-size: 12px;
  padding: 4px 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: var(--ion-color-medium);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 8px;
}
</style>
