const autocannon = require('autocannon');

async function runBenchmark() {
  const result = await autocannon({
    url: 'http://localhost:5000/api/menus',
    connections: 10,
    duration: 10
  });

  console.log('🚀 GOURMI IQ - RÉSULTAT BENCHMARK PERF');
  console.log(`Requêtes/sec : ${result.requests.average}`);
  console.log(`Latence P99 : ${result.latency.p99} ms`);
  
  if (result.errors > 0) {
    console.warn(`⚠️ Erreurs détectées : ${result.errors}`);
  }
}

// Pour usage manuel via node __tests__/perf/benchmark.js
if (require.main === module) {
  runBenchmark();
}

module.exports = runBenchmark;
