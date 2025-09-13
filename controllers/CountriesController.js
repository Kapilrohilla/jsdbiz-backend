const { getNames, getCode, getName } = require('country-list');

function listCountries(req, res) {
  try {
    const names = getNames();
    const countries = names
      .map((name) => ({
        name,
        code: getCode(name),
      }))
      .filter((c) => Boolean(c.code))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.json({ type: 'success', data: countries });
  } catch (err) {
    return res.status(500).json({ type: 'error', message: 'Failed to load countries' });
  }
}

module.exports = { listCountries };


