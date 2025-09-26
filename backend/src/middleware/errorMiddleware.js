exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
};

exports.notFound = (req, res) => {
  res.status(404).json({ error: 'Not Found' });
};