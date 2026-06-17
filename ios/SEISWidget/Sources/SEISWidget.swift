import SwiftUI

/// SEIS Widget - Anlık Sistem Durumu ve İlham
/// Apple-First vizyonunun somut bir prototipi.
/// iOS 14+ uyumlu, minimal ve bilgilendirici.

import WidgetKit

struct SEISWidgetEntry: TimelineEntry {
    let date: Date
    let systemStatus: SystemStatus
    val inspiration: String
}

struct SystemStatus {
    let health: Int // 0-100
    let activeAgents: Int
    let securityLevel: String // "Secure", "Warning", "Critical"
}

struct SEISWidgetEntryView : View {
    var entry: SEISWidgetEntryProvider.Entry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Başlık
            HStack {
                Image(systemName: "cpu.fill")
                    .foregroundColor(.accentColor)
                Text("SEIS Core")
                    .font(.headline)
                    .fontWeight(.bold)
                Spacer()
                Text(entry.date, style: .time)
                    .font(.caption2)
                    .opacity(0.7)
            }

            Divider()

            // Durum Metrikleri
            HStack(spacing: 15) {
                MetricView(label: "Health", value: "\(entry.systemStatus.health)%", icon: "heart.fill", color: .green)
                MetricView(label: "Agents", value: "\(entry.systemStatus.activeAgents)", icon: "robot.fill", color: .blue)
            }

            // Güvenlik Durumu
            HStack {
                Image(systemName: entry.systemStatus.securityLevel == "Secure" ? "shield.fill" : "exclamationmark.shield.fill")
                    .foregroundColor(entry.systemStatus.securityLevel == "Secure" ? .green : .orange)
                Text(entry.systemStatus.securityLevel)
                    .font(.caption)
                    .fontWeight(.medium)
            }
            .padding(.top, 4)

            Spacer()
            
            // Günlük İlham / V14 Alıntısı
            Text("\"\(entry.inspiration)\"")
                .font(.caption2)
                .italic()
                .opacity(0.8)
                .lineLimit(2)
        }
        .padding()
        .background(colorScheme == .dark ? Color.black.opacity(0.8) : Color.white.opacity(0.9))
        .cornerRadius(16)
    }
}

struct MetricView: View {
    let label: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(color)
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            Text(label)
                .font(.caption2)
                .opacity(0.7)
        }
    }
}

// Widget Provider (Mock Veri)
struct SEISWidgetEntryProvider: TimelineProvider {
    func placeholder(in context: Context) -> SEISWidgetEntry {
        SEISWidgetEntry(date: Date(), systemStatus: mockStatus, inspiration: "Design is intelligence made visible.")
    }

    func getSnapshot(in context: Context, completion: @escaping (SEISWidgetEntry) -> Void) {
        let entry = SEISWidgetEntry(date: Date(), systemStatus: mockStatus, inspiration: "Simplicity is the ultimate sophistication.")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
        let entry = SEISWidgetEntry(date: Date(), systemStatus: mockStatus, inspiration: "Code is poetry in motion.")
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
    
    var mockStatus: SystemStatus {
        SystemStatus(health: 98, activeAgents: 4, securityLevel: "Secure")
    }
}

@main
struct SEISWidget: Widget {
    let kind: String = "SEISWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SEISWidgetEntryProvider()) { entry in
            SEISWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("SEIS Dashboard")
        .description("Anlık sistem durumu ve AI ajan metrikleri.")
        .supportedFamilies([.systemSmall])
    }
}

// Önizleme
struct SEISWidget_Previews: PreviewProvider {
    static var previews: some View {
        SEISWidgetEntryView(entry: SEISWidgetEntry(date: Date(), systemStatus: SystemStatus(health: 98, activeAgents: 4, securityLevel: "Secure"), inspiration: "Hello World"))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
