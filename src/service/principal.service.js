import { api } from './api';

const BASE_URL = '/principals';

/**
 * Fetches principals with optional query parameters for filtering, sorting, and pagination.
 * @param {URLSearchParams} [params] - Optional query parameters.
 * @returns {Promise<Array>} A promise that resolves to an array of principals.
 */
const getAll = (params) => {
    return api.get(BASE_URL, { params });
};

/**
 * Fetches a single principal by their ID.
 * @param {string|number} id The ID of the principal.
 * @returns {Promise<Object>} A promise that resolves to the principal object.
 */
const getById = (id) => {
    return api.get(`${BASE_URL}/${id}`);
};

/**
 * Creates a new principal.
 * @param {Object} data The data for the new principal.
 * @returns {Promise<Object>} A promise that resolves to the newly created principal data.
 */
const create = (data) => {
    return api.post(BASE_URL, data);
};

/**
 * Updates an existing principal.
 * @param {string|number} id The ID of the principal to update.
 * @param {Object} data The new data for the principal.
 * @returns {Promise<Object>} A promise that resolves to the update confirmation.
 */
const update = (id, data) => {
    return api.put(`${BASE_URL}/${id}`, data);
};

/**
 * Deletes a principal by their ID.
 * @param {string|number} id The ID of the principal to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
const remove = (id) => {
    return api.delete(`${BASE_URL}/${id}`);
};

export const principalService = {
    getAll,
    getById,
    create,
    update,
    delete: remove,
};