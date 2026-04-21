const autocannon = require('autocannon');

async function runBenchmark() {
  const result = await autocannon({
    url: 'http://localhost:5000/api/orders',
    connections: 50, // Charge plus lourde
    duration: 10
  });

  console.log('🔥 TEST DE CHARGE CRITIQUE - ORDERS');
  console.log(`Throughput : ${result.requests.average} req/sec`);
  console.log(`Latency P99 : ${result.latency.p99} ms`);
  
  if (result.errors > 0 || result.timeouts > 0) {
    console.error('❌ PERFORMANCES DÉGRADÉES : Attention aux goulots d\'étranglement base de données.');
  }
}

if (require.main === module) {
  runBenchmark();
}
