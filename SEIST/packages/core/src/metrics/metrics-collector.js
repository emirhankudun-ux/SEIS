/**
 * SEIS Core Metrics System
 * Performance monitoring, metrics collection, and analytics
 * 
 * @module @seis/core/metrics
 * @version 1.0.0
 */

class MetricsCollector {
  constructor(options = {}) {
    this.metrics = new Map();
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
    this.timers = new Map();
    this.events = [];
    this.maxEvents = options.maxEvents || 1000;
    this.debug = options.debug || false;
    this.exportInterval = options.exportInterval || 60000; // 1 minute
    
    // Auto-export if enabled
    if (options.autoExport) {
      this.startAutoExport(options.exportCallback);
    }
    
    this.log('MetricsCollector initialized');
  }

  /**
   * Record a counter metric
   * @param {string} name - Metric name
   * @param {number} value - Value to add (default: 1)
   * @param {Object} labels - Optional labels
   */
  increment(name, value = 1, labels = {}) {
    const key = this.makeKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    
    this.recordEvent({
      type: 'counter',
      name,
      value,
      labels,
      timestamp: Date.now()
    });
    
    return this;
  }

  /**
   * Set a gauge metric
   * @param {string} name - Metric name
   * @param {number} value - Gauge value
   * @param {Object} labels - Optional labels
   */
  gauge(name, value, labels = {}) {
    const key = this.makeKey(name, labels);
    this.gauges.set(key, { value, labels, timestamp: Date.now() });
    
    this.recordEvent({
      type: 'gauge',
      name,
      value,
      labels,
      timestamp: Date.now()
    });
    
    return this;
  }

  /**
   * Record a histogram observation
   * @param {string} name - Metric name
   * @param {number} value - Observed value
   * @param {Object} labels - Optional labels
   */
  observe(name, value, labels = {}) {
    const key = this.makeKey(name, labels);
    
    if (!this.histograms.has(key)) {
      this.histograms.set(key, {
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        values: [],
        buckets: this.createBuckets(),
        labels
      });
    }
    
    const histogram = this.histograms.get(key);
    histogram.count++;
    histogram.sum += value;
    histogram.min = Math.min(histogram.min, value);
    histogram.max = Math.max(histogram.max, value);
    histogram.values.push(value);
    
    // Keep only last 1000 values for memory efficiency
    if (histogram.values.length > 1000) {
      histogram.values.shift();
    }
    
    // Update bucket counts
    for (const bucket of histogram.buckets) {
      if (value <= bucket.le) {
        bucket.count++;
      }
    }
    
    this.recordEvent({
      type: 'histogram',
      name,
      value,
      labels,
      timestamp: Date.now()
    });
    
    return this;
  }

  /**
   * Start timing an operation
   * @param {string} name - Timer name
   * @returns {Function} Stop function
   */
  startTimer(name) {
    const startTime = Date.now();
    this.timers.set(name, startTime);
    
    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.timers.delete(name);
      this.observe(`${name}_duration`, duration);
      return duration;
    };
  }

  /**
   * Time an async operation
   * @param {string} name - Timer name
   * @param {Function} fn - Async function to time
   * @returns {Promise} Result with timing info
   */
  async timeAsync(name, fn) {
    const stopTimer = this.startTimer(name);
    try {
      const result = await fn();
      const duration = stopTimer();
      return { result, duration };
    } catch (error) {
      stopTimer();
      this.increment(`${name}_errors`);
      throw error;
    }
  }

  /**
   * Get metric summary
   * @param {string} name - Metric name
   * @param {Object} labels - Optional labels
   * @returns {Object} Metric data
   */
  getMetric(name, labels = {}) {
    const key = this.makeKey(name, labels);
    
    return {
      counter: this.counters.get(key) || 0,
      gauge: this.gauges.get(key),
      histogram: this.histograms.get(key) ? this.calculateHistogramStats(this.histograms.get(key)) : null
    };
  }

  /**
   * Calculate histogram statistics
   * @private
   */
  calculateHistogramStats(histogram) {
    if (histogram.count === 0) return null;
    
    const sorted = [...histogram.values].sort((a, b) => a - b);
    const p50 = this.percentile(sorted, 50);
    const p90 = this.percentile(sorted, 90);
    const p95 = this.percentile(sorted, 95);
    const p99 = this.percentile(sorted, 99);
    const avg = histogram.sum / histogram.count;
    
    return {
      count: histogram.count,
      sum: histogram.sum,
      min: histogram.min,
      max: histogram.max,
      avg,
      p50,
      p90,
      p95,
      p99,
      buckets: histogram.buckets
    };
  }

  /**
   * Calculate percentile
   * @private
   */
  percentile(sortedValues, p) {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil((p / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * Create default histogram buckets
   * @private
   */
  createBuckets() {
    return [
      { le: 5, count: 0 },
      { le: 10, count: 0 },
      { le: 25, count: 0 },
      { le: 50, count: 0 },
      { le: 100, count: 0 },
      { le: 250, count: 0 },
      { le: 500, count: 0 },
      { le: 1000, count: 0 },
      { le: 2500, count: 0 },
      { le: 5000, count: 0 },
      { le: 10000, count: 0 },
      { le: Infinity, count: 0 }
    ];
  }

  /**
   * Make unique key from name and labels
   * @private
   */
  makeKey(name, labels) {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('|');
    
    return labelStr ? `${name}|${labelStr}` : name;
  }

  /**
   * Record event
   * @private
   */
  recordEvent(event) {
    this.events.push(event);
    
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  /**
   * Get all metrics
   * @returns {Object} All metrics data
   */
  getAllMetrics() {
    const counters = {};
    const gauges = {};
    const histograms = {};
    
    for (const [key, value] of this.counters) {
      counters[key] = value;
    }
    
    for (const [key, { value, labels, timestamp }] of this.gauges) {
      gauges[key] = { value, labels, timestamp };
    }
    
    for (const [key, histogram] of this.histograms) {
      histograms[key] = this.calculateHistogramStats(histogram);
    }
    
    return { counters, gauges, histograms };
  }

  /**
   * Get recent events
   * @param {number} limit - Max events to return
   * @returns {Array} Events
   */
  getEvents(limit = 100) {
    return this.events.slice(-limit);
  }

  /**
   * Export metrics in Prometheus format
   * @returns {string} Prometheus-formatted metrics
   */
  exportPrometheus() {
    const lines = [];
    
    // Export counters
    for (const [key, value] of this.counters) {
      const [name, ...labels] = key.split('|');
      const labelStr = labels.length > 0 ? `{${labels.join(',')}}` : '';
      lines.push(`# TYPE ${name} counter`);
      lines.push(`${name}${labelStr} ${value}`);
    }
    
    // Export gauges
    for (const [key, { value, labels }] of this.gauges) {
      const [name, ...labelParts] = key.split('|');
      const labelStr = labels && Object.keys(labels).length > 0 
        ? `{${Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',')}}` 
        : '';
      lines.push(`# TYPE ${name} gauge`);
      lines.push(`${name}${labelStr} ${value}`);
    }
    
    // Export histograms
    for (const [key, histogram] of this.histograms) {
      const [name, ...labels] = key.split('|');
      const baseLabels = labels.length > 0 ? `{${labels.join(',')}}` : '';
      
      lines.push(`# TYPE ${name} histogram`);
      
      for (const bucket of histogram.buckets) {
        const bucketLabels = baseLabels 
          ? baseLabels.replace('}', `,le="${bucket.le}"}`) 
          : `{le="${bucket.le}"}`;
        lines.push(`${name}_bucket${bucketLabels} ${bucket.count}`);
      }
      
      lines.push(`${name}_sum${baseLabels} ${histogram.sum}`);
      lines.push(`${name}_count${baseLabels} ${histogram.count}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Start auto-export
   * @private
   */
  startAutoExport(callback) {
    this.exportTimer = setInterval(() => {
      const metrics = this.getAllMetrics();
      if (callback) {
        callback(metrics);
      }
      this.log('Auto-exported metrics');
    }, this.exportInterval);
  }

  /**
   * Stop auto-export
   */
  stopAutoExport() {
    if (this.exportTimer) {
      clearInterval(this.exportTimer);
      this.exportTimer = null;
    }
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.events = [];
    this.log('Metrics cleared');
  }

  /**
   * Debug logging
   * @private
   */
  log(...args) {
    if (this.debug) {
      console.log('[SEIS Metrics]', ...args);
    }
  }
}

// Pre-built metric helpers
export const httpMetrics = {
  requestCount: (collector, method, path, status) => {
    collector.increment('http_requests_total', 1, { method, path, status });
  },
  
  requestDuration: (collector, method, path, duration) => {
    collector.observe('http_request_duration_seconds', duration / 1000, { method, path });
  },
  
  responseSize: (collector, method, path, size) => {
    collector.observe('http_response_size_bytes', size, { method, path });
  }
};

export const systemMetrics = {
  memoryUsage: (collector) => {
    const usage = process.memoryUsage();
    collector.gauge('node_memory_heap_used', usage.heapUsed);
    collector.gauge('node_memory_heap_total', usage.heapTotal);
    collector.gauge('node_memory_rss', usage.rss);
    collector.gauge('node_memory_external', usage.external);
  },
  
  cpuUsage: (collector) => {
    const usage = process.cpuUsage();
    collector.gauge('node_cpu_user', usage.user);
    collector.gauge('node_cpu_system', usage.system);
  },
  
  activeHandles: (collector) => {
    collector.gauge('node_active_handles', process._getActiveHandles().length);
    collector.gauge('node_active_requests', process._getActiveRequests().length);
  }
};

export default MetricsCollector;
