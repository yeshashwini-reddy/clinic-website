import { getDocs, getDoc, addDoc, setDoc, runTransaction } from 'firebase/firestore';

// Helper to update local storage cache for a given collection
const updateLocalStorageCache = (collectionName, docs) => {
  try {
    const key = `vanitha_clinic_${collectionName}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const map = new Map(existing.map(d => [d.id, d]));
    docs.forEach(doc => {
      map.set(doc.id, { ...map.get(doc.id), ...doc });
    });
    localStorage.setItem(key, JSON.stringify(Array.from(map.values())));
  } catch (e) {
    console.error('Failed to update local cache:', e);
  }
};

// Helper to serialize data, converting any Firestore FieldValues (like serverTimestamp) to standard format
const serializeForLocalStorage = (data) => {
  const serialized = { ...data };
  for (const key in serialized) {
    const val = serialized[key];
    if (val && typeof val === 'object') {
      if (val._methodName === 'serverTimestamp' || (val.constructor && val.constructor.name === 'FieldValue')) {
        serialized[key] = new Date().toISOString();
      }
    }
  }
  return serialized;
};

// Helper to extract collection path from a query/collection reference
const getCollectionPath = (queryRef) => {
  if (queryRef.path) return queryRef.path;
  if (queryRef._query && queryRef._query.path && queryRef._query.path.segments) {
    return queryRef._query.path.segments[0];
  }
  const str = queryRef.toString ? queryRef.toString() : '';
  if (str.includes('/appointments')) return 'appointments';
  if (str.includes('/doctors')) return 'doctors';
  if (str.includes('/payments')) return 'payments';
  return null;
};

// Extract field=value filters from a Firestore Query object
const extractQueryFilters = (queryRef) => {
  const filters = {};
  try {
    // Firebase v9+ stores filters in _query.filters as an array of QueryFieldFilterConstraint
    const rawFilters =
      queryRef._query?.filters ||
      queryRef._query?.compositeFilter?.filters ||
      [];
    for (const f of rawFilters) {
      // Each filter has: field.segments[], op, value.stringValue / value.integerValue etc.
      const fieldName = f.field?.segments?.[0] || f._field?.segments?.[0];
      const value =
        f.value?.stringValue ??
        f.value?.integerValue ??
        f.value?.booleanValue ??
        f._value?.stringValue ??
        f._value?.integerValue ??
        f._value?.booleanValue;
      if (fieldName !== undefined && value !== undefined) {
        filters[fieldName] = value;
      }
    }
  } catch (_) {}
  return filters;
};

// Filter offline local cache data based on parsed query constraints
const filterLocalData = (collectionName, queryRef) => {
  const key = `vanitha_clinic_${collectionName}`;
  const data = JSON.parse(localStorage.getItem(key) || '[]');

  // Collection-level ref (no filters) — return all
  if (queryRef.path) return data;

  const filters = extractQueryFilters(queryRef);
  if (Object.keys(filters).length === 0) return data;

  return data.filter(item => {
    for (const [field, value] of Object.entries(filters)) {
      if (item[field] !== value) return false;
    }
    return true;
  });
};

/**
 * Executes a getDocs query with a safety timeout and LocalStorage cache fallback.
 * @param {Query} queryRef - The Firestore query reference.
 * @param {number} timeoutMs - Timeout in milliseconds (default 3000ms).
 * @returns {Promise<QuerySnapshot>}
 */
export const getDocsWithTimeout = async (queryRef, timeoutMs = 1200) => {
  const fetchPromise = getDocs(queryRef);
  fetchPromise.catch(() => {}); // Prevent unhandled promise rejection if timeout wins
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Firestore network query timed out')), timeoutMs)
  );
  try {
    const snap = await Promise.race([fetchPromise, timeoutPromise]);
    const collectionName = getCollectionPath(queryRef);
    if (collectionName) {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateLocalStorageCache(collectionName, docs);
    }
    return snap;
  } catch (err) {
    const collectionName = getCollectionPath(queryRef);
    console.warn(`Firestore getDocs failed for ${collectionName || 'unknown'}, falling back to localStorage cache:`, err);
    if (collectionName) {
      const filtered = filterLocalData(collectionName, queryRef);
      return {
        _fromCache: true,
        docs: filtered.map(item => {
          const { id, ...rest } = item;
          return { id, data: () => rest };
        }),
        size: filtered.length,
        empty: filtered.length === 0
      };
    }
    throw err;
  }
};

/**
 * Executes a getDoc fetch with a safety timeout and LocalStorage cache fallback.
 * @param {DocumentReference} docRef - The Firestore document reference.
 * @param {number} timeoutMs - Timeout in milliseconds (default 3000ms).
 * @returns {Promise<DocumentSnapshot>}
 */
export const getDocWithTimeout = async (docRef, timeoutMs = 1200) => {
  const fetchPromise = getDoc(docRef);
  fetchPromise.catch(() => {}); // Prevent unhandled promise rejection if timeout wins
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Firestore network document fetch timed out')), timeoutMs)
  );
  try {
    const snap = await Promise.race([fetchPromise, timeoutPromise]);
    if (snap.exists()) {
      const collectionName = docRef.parent ? docRef.parent.path : (docRef.path ? docRef.path.split('/')[0] : '');
      if (collectionName) {
        updateLocalStorageCache(collectionName, [{ id: docRef.id, ...snap.data() }]);
      }
    }
    return snap;
  } catch (err) {
    const collectionName = docRef.parent ? docRef.parent.path : (docRef.path ? docRef.path.split('/')[0] : '');
    console.warn(`Firestore getDoc failed for ${docRef.path || 'unknown'}, falling back to localStorage cache:`, err);
    if (collectionName) {
      const key = `vanitha_clinic_${collectionName}`;
      const cached = JSON.parse(localStorage.getItem(key) || '[]');
      const found = cached.find(d => d.id === docRef.id);
      if (found) {
        return {
          exists: () => true,
          id: docRef.id,
          data: () => found
        };
      }
    }
    throw err;
  }
};

/**
 * Executes an addDoc write with a safety timeout and LocalStorage cache sync.
 * @param {CollectionReference} collectionRef - The Firestore collection reference.
 * @param {object} data - The document data to write.
 * @param {number} timeoutMs - Timeout in milliseconds (default 3000ms).
 * @returns {Promise<DocumentReference>}
 */
export const addDocWithTimeout = async (collectionRef, data, timeoutMs = 1200) => {
  const writePromise = addDoc(collectionRef, data);
  writePromise.catch(() => {}); // Prevent unhandled promise rejection if timeout wins
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Firestore addDoc write timed out')), timeoutMs)
  );
  try {
    const docRef = await Promise.race([writePromise, timeoutPromise]);
    const collectionName = collectionRef.path;
    if (collectionName) {
      updateLocalStorageCache(collectionName, [{ id: docRef.id, ...data }]);
    }
    return docRef;
  } catch (err) {
    const collectionName = collectionRef.path;
    console.warn(`Firestore addDoc failed for ${collectionName || 'unknown'}, falling back to localStorage cache:`, err);
    if (collectionName) {
      const localId = `local_${collectionName}_${Date.now()}`;
      const serialized = serializeForLocalStorage(data);
      updateLocalStorageCache(collectionName, [{ id: localId, ...serialized, isOffline: true }]);
      return { id: localId };
    }
    throw err;
  }
};

/**
 * Executes a setDoc write with a safety timeout and LocalStorage cache sync.
 * @param {DocumentReference} docRef - The Firestore document reference.
 * @param {object} data - The document data to write.
 * @param {object} options - Optional set options.
 * @param {number} timeoutMs - Timeout in milliseconds.
 * @returns {Promise<void>}
 */
export const setDocWithTimeout = async (docRef, data, options = {}, timeoutMs = 1200) => {
  const writePromise = setDoc(docRef, data, options);
  writePromise.catch(() => {}); // Prevent unhandled promise rejection if timeout wins
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Firestore setDoc write timed out')), timeoutMs)
  );
  try {
    await Promise.race([writePromise, timeoutPromise]);
    const collectionName = docRef.parent ? docRef.parent.path : (docRef.path ? docRef.path.split('/')[0] : '');
    if (collectionName) {
      updateLocalStorageCache(collectionName, [{ id: docRef.id, ...data }]);
    }
  } catch (err) {
    const collectionName = docRef.parent ? docRef.parent.path : (docRef.path ? docRef.path.split('/')[0] : '');
    console.warn(`Firestore setDoc failed for ${collectionName || 'unknown'}, falling back to localStorage cache:`, err);
    if (collectionName) {
      const serialized = serializeForLocalStorage(data);
      updateLocalStorageCache(collectionName, [{ id: docRef.id, ...serialized, isOffline: true }]);
      return;
    }
    throw err;
  }
};

/**
 * Runs a Firestore transaction with a safety timeout.
 * @param {Firestore} db - The Firestore database instance.
 * @param {function} updateFunction - The transaction handler function.
 * @param {number} timeoutMs - Timeout in milliseconds (default 3000ms).
 * @returns {Promise<any>}
 */
export const runTransactionWithTimeout = async (db, updateFunction, timeoutMs = 1200) => {
  const transactionPromise = runTransaction(db, updateFunction);
  transactionPromise.catch(() => {}); // Prevent unhandled promise rejection if timeout wins
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Firestore transaction timed out')), timeoutMs)
  );
  return Promise.race([transactionPromise, timeoutPromise]);
};

