import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// =====================
// CUSTOM METRICS
// =====================

export const compareTrend = new Trend('compare_duration');
export const stockTrend = new Trend('stock_duration');
export const analysisTrend = new Trend('analysis_duration');
export const chartTrend = new Trend('chart_duration');
export const glossaryTrend = new Trend('glossary_duration');
export const authTrend = new Trend('auth_duration');

export const errorRate = new Rate('errors');

// =====================
// CONFIGURATION
// =====================

export const options = {
    stages: [
        { duration: '5m', target: 200 },   // Номинальная нагрузка
        { duration: '4m', target: 300 },    // Средняя нагрузка
        { duration: '3m', target: 400 },   // Пиковая нагрузка
        { duration: '2m', target: 500 },  // Стресс-тест
        { duration: '1m', target: 600 },
    ],

    thresholds: {
        http_req_duration: ['p(95)<2000'],
        errors: ['rate<0.05'],
    },
};

// =====================
// BASE CONFIG
// =====================

const BASE_URL = 'http://localhost:8080/api';

const TEST_USER = {
    email: 'loadtest@example.com',
    username: 'loadtest',
    password: 'password123'
};

const TICKERS = [
    'SBER', // Сбербанк
    'GAZP', // Газпром
    'LKOH', // Лукойл
    'ROSN', // Роснефть
    'NVTK', // Новатэк
    'GMKN'  // Норникель
];

// =====================
// AUTH
// =====================

function login() {

    const payload = JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
    });

    const params = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const response = http.post(
        `${BASE_URL}/auth/login`,
        payload,
        params
    );

    authTrend.add(response.timings.duration);

    const success = check(response, {
        'login status is 200': (r) => r.status === 200,
        'token exists': (r) => JSON.parse(r.body).token !== undefined
    });

    errorRate.add(!success);

    return JSON.parse(response.body).token;
}

// =====================
// MAIN TEST
// =====================

export default function () {

    const token = login();

    const authHeaders = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const ticker = TICKERS[Math.floor(Math.random() * TICKERS.length)];

    // ========================================
    // GET STOCK
    // ========================================

    const stockResponse = http.get(
        `${BASE_URL}/stocks/${ticker}`,
        authHeaders
    );

    stockTrend.add(stockResponse.timings.duration);

    const stockSuccess = check(stockResponse, {
        'stock status 200': (r) => r.status === 200
    });

    errorRate.add(!stockSuccess);

    sleep(1);

    // ========================================
    // GET PRICE
    // ========================================

    const priceResponse = http.get(
        `${BASE_URL}/stocks/${ticker}/price`,
        authHeaders
    );

    check(priceResponse, {
        'price status 200': (r) => r.status === 200
    });

    sleep(1);

    // ========================================
    // GET ANALYSIS
    // ========================================

    const analysisResponse = http.get(
        `${BASE_URL}/stocks/${ticker}/analysis`,
        authHeaders
    );

    analysisTrend.add(analysisResponse.timings.duration);

    const analysisSuccess = check(analysisResponse, {
        'analysis status 200': (r) => r.status === 200
    });

    errorRate.add(!analysisSuccess);

    sleep(1);

    // ========================================
    // GET CHART
    // ========================================

    const chartResponse = http.get(
        `${BASE_URL}/stocks/${ticker}/chart?period=3M`,
        authHeaders
    );

    chartTrend.add(chartResponse.timings.duration);

    const chartSuccess = check(chartResponse, {
        'chart status 200': (r) => r.status === 200
    });

    errorRate.add(!chartSuccess);

    sleep(1);

    // ========================================
    // COMPARE
    // ========================================

    const comparePayload = JSON.stringify({
        tickers: ['SBER', 'GAZP', 'LKOH']
    });

    const compareResponse = http.post(
        `${BASE_URL}/compare`,
        comparePayload,
        authHeaders
    );

    compareTrend.add(compareResponse.timings.duration);

    const compareSuccess = check(compareResponse, {
        'compare status 200': (r) => r.status === 200
    });

    errorRate.add(!compareSuccess);

    sleep(1);

    // ========================================
    // GLOSSARY
    // ========================================

    const glossaryResponse = http.get(
        `${BASE_URL}/glossary?category=fundamental`,
        authHeaders
    );

    glossaryTrend.add(glossaryResponse.timings.duration);

    const glossarySuccess = check(glossaryResponse, {
        'glossary status 200': (r) => r.status === 200
    });

    errorRate.add(!glossarySuccess);

    sleep(1);
}