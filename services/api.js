// services/api.js
import axios from 'axios';
import { API_URL } from '../src/config/index';

const BASE_URL = `${API_URL}/medicines`;

// Если ваш токен хранится в localStorage:
function getAuthHeaders() {
    return {
        headers: {
            Authorization: localStorage.getItem('authToken'),
        },
    };
}

/**
 * Получить список лекарств (с пагинацией и сортировкой).
 * @param {number} page - номер страницы (с 0).
 * @param {number} size - сколько строк на странице.
 * @param {string} sort - строка вида "name,asc" или "expirationDate,desc" и т.д.
 * @returns {Promise<any>} - промис с данными.
 */
export async function getMedicines(page, size, sort) {
    const response = await axios.get(BASE_URL, {
        ...getAuthHeaders(),
        params: { page, size, sort },
    });
    return response.data;
}

/**
 * Создать новое лекарство.
 * @param {object} data - { name, serialNumber, expirationDate }
 */
export async function createMedicine(data) {
    return axios.post(BASE_URL, data, getAuthHeaders());
}

/**
 * Обновить существующее лекарство.
 * @param {string | number} id
 * @param {object} data - { name, serialNumber, expirationDate }
 */
export async function updateMedicine(id, data) {
    return axios.put(`${BASE_URL}/${id}`, data, getAuthHeaders());
}

/**
 * Удалить лекарство по ID.
 * @param {string | number} id
 */
export async function deleteMedicine(id) {
    return axios.delete(`${BASE_URL}/${id}`, getAuthHeaders());
}

/**
 * Удалить несколько лекарств (для «Удалить выбранные»).
 * @param {Array<string | number>} ids
 */
export async function deleteMultipleMedicines(ids) {
    const promises = ids.map((id) => deleteMedicine(id));
    return Promise.all(promises);
}
