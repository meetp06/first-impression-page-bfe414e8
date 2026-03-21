// PermitWatch AI — Apify Service
// HTTP client for Apify Cloud API.
// Handles actor runs, polling, and dataset fetching.
// When VITE_APIFY_TOKEN is not set, returns mock scraped data.

const APIFY_TOKEN    = import.meta.env.VITE_APIFY_TOKEN || '';
// In dev, route through Vite proxy to bypass CORS
const APIFY_BASE_URL = import.meta.env.DEV ? '/apify-proxy/v2' : 'https://api.apify.com/v2';

/**
 * Check if Apify integration is configured.
 */
export function isApifyConfigured() {
  return !!APIFY_TOKEN;
}

/**
 * Start an Apify actor run.
 *
 * @param {string} actorId — Actor ID (e.g. 'username/actor-name' or 'actorId')
 * @param {object} input   — Actor input configuration
 * @returns {Promise<{ id: string, status: string, datasetId: string }>}
 */
export async function runActor(actorId, input = {}) {
  // Apify REST API requires slashes in actor IDs to be encoded as tildes
  const encodedActorId = actorId.replace('/', '~');
  const res = await fetch(`${APIFY_BASE_URL}/acts/${encodedActorId}/runs?token=${APIFY_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Apify runActor failed (${res.status}): ${error}`);
  }

  const data = await res.json();
  return {
    id: data.data.id,
    status: data.data.status,
    datasetId: data.data.defaultDatasetId,
  };
}

/**
 * Poll an actor run until it finishes (SUCCEEDED, FAILED, ABORTED, TIMED-OUT).
 *
 * @param {string} runId        — The run ID from runActor()
 * @param {object} options      — { pollIntervalMs, timeoutMs, onStatusChange }
 * @returns {Promise<{ status: string, datasetId: string }>}
 */
export async function waitForRun(runId, options = {}) {
  const {
    pollIntervalMs = 3000,
    timeoutMs = 120000, // 2 minutes max
    onStatusChange = null,
  } = options;

  const startTime = Date.now();
  let lastStatus = '';

  while (true) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Apify run ${runId} timed out after ${timeoutMs / 1000}s`);
    }

    const res = await fetch(`${APIFY_BASE_URL}/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    if (!res.ok) throw new Error(`Failed to check run status: ${res.status}`);

    const data = await res.json();
    const status = data.data.status;

    if (status !== lastStatus) {
      lastStatus = status;
      onStatusChange?.(status);
    }

    if (status === 'SUCCEEDED') {
      return {
        status,
        datasetId: data.data.defaultDatasetId,
      };
    }

    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
      throw new Error(`Apify run ${runId} ended with status: ${status}`);
    }

    // Wait before next poll
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
}

/**
 * Fetch all items from an Apify dataset.
 *
 * @param {string} datasetId — Dataset ID from the completed run
 * @param {object} options   — { limit, offset, format }
 * @returns {Promise<Array<object>>} — Array of raw scraped records
 */
export async function getDatasetItems(datasetId, options = {}) {
  const { limit = 1000, offset = 0 } = options;

  const url = `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${APIFY_TOKEN}&limit=${limit}&offset=${offset}&format=json`;
  const res = await fetch(url);

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch dataset (${res.status}): ${error}`);
  }

  return res.json(); // Returns array of items directly
}

/**
 * Convenience: run an actor, wait for completion, and return all dataset items.
 *
 * @param {string} actorId         — Actor ID
 * @param {object} input           — Actor input
 * @param {object} options         — { pollIntervalMs, timeoutMs, onStatusChange }
 * @returns {Promise<{ items: Array, runId: string, datasetId: string }>}
 */
export async function runAndCollect(actorId, input = {}, options = {}) {
  const run = await runActor(actorId, input);
  options.onStatusChange?.('RUNNING');

  const completed = await waitForRun(run.id, options);
  const items = await getDatasetItems(completed.datasetId);

  return {
    items,
    runId: run.id,
    datasetId: completed.datasetId,
  };
}

/**
 * Mock scraping for development when Apify is not configured.
 * Returns fake raw scraped records that look like real scraper output.
 *
 * @param {string} city — City ID
 * @returns {Promise<Array<object>>}
 */
export async function getMockScrapedData(city) {
  await new Promise((r) => setTimeout(r, 1500)); // Simulate scraping delay

  const mockRecords = {
    'san-francisco': [
      {
        source_url: 'https://dbiweb02.sfgov.org/dbipts/',
        source_name: 'SF DBI Online Permit Portal',
        source_type: 'building_permit',
        raw_title: 'New 28-story mixed-use tower at 350 5th Street',
        raw_address: '350 5th Street, San Francisco, CA 94107',
        raw_description: 'Construction of a 28-story mixed-use tower with 340 residential units, ground-floor retail, and 2 levels of below-grade parking.',
        permit_number: 'PA-2026-003241',
        permit_status: 'Approved',
        filing_date: '2026-03-18',
        raw_text: 'Full MEP scope required. Environmental review complete. Planning Commission approval received. Developer has active financing confirmed.',
      },
      {
        source_url: 'https://sfplanning.org/notices',
        source_name: 'SF Planning Dept Public Notices',
        source_type: 'public_notice',
        raw_title: 'Historic office building renovation at 456 Montgomery St',
        raw_address: '456 Montgomery Street, San Francisco, CA 94104',
        raw_description: 'Complete interior renovation of 12-story Class B office building to Class A standards.',
        permit_number: null,
        permit_status: 'Under Review',
        filing_date: '2026-03-17',
        raw_text: 'New electrical systems, plumbing upgrades, HVAC modernization, seismic retrofit. Historic preservation guidelines apply. Historic review pending.',
      },
      {
        source_url: 'https://dbiweb02.sfgov.org/dbipts/',
        source_name: 'SF DBI Online Permit Portal',
        source_type: 'building_permit',
        raw_title: 'Full plumbing system replacement — 2840 Pacific Avenue',
        raw_address: '2840 Pacific Avenue, San Francisco, CA 94115',
        raw_description: 'Full plumbing system replacement for 6-unit Victorian residential building.',
        permit_number: 'PL-2026-008712',
        permit_status: 'Permit Issued',
        filing_date: '2026-03-19',
        raw_text: 'New copper supply lines, PVC drain lines, water heater replacement (6 units), bathroom fixture upgrades. Lead pipe abatement required. Contractor bid period open.',
      },
    ],
    'san-jose': [
      {
        source_url: 'https://sjpermits.org',
        source_name: 'San Jose Permit Center',
        source_type: 'building_permit',
        raw_title: 'Downtown mixed-use development at 200 E Santa Clara St',
        raw_address: '200 E Santa Clara Street, San Jose, CA 95113',
        raw_description: '18-story residential tower with 220 units over ground-floor retail.',
        permit_number: 'SJ-BP-2026-04521',
        permit_status: 'Approved',
        filing_date: '2026-03-19',
        raw_text: 'Two levels underground parking. Full MEP systems, high-rise fire protection, smart building infrastructure. Developer is well-capitalized. GC bidding phase starting.',
      },
      {
        source_url: 'https://sjpermits.org',
        source_name: 'San Jose Permit Center',
        source_type: 'building_permit',
        raw_title: 'Complete water supply repiping — 1455 Kooser Road',
        raw_address: '1455 Kooser Road, San Jose, CA 95118',
        raw_description: 'Complete water supply repiping for 24-unit apartment complex.',
        permit_number: 'SJ-PL-2026-01887',
        permit_status: 'Permit Issued',
        filing_date: '2026-03-20',
        raw_text: 'Replace all galvanized steel piping with PEX. New water meters, backflow prevention. Individual unit shut-off valves. Property management confirmed scope.',
      },
    ],
  };

  return mockRecords[city] || [];
}
