import WidgetKit
import SwiftUI

// MARK: - Models

/// Fear & Greed from our proxy: { "score": 38, "rating": "fear", "timestamp": "..." }
struct WidgetData: Decodable {
    let score: Int
    let rating: String
    let timestamp: String
    
    var ratingColor: Color {
        let r = rating.lowercased()
        if r.contains("extreme fear") { return .red }
        if r.contains("fear") { return .orange }
        if r.contains("neutral") { return .gray }
        if r.contains("extreme greed") { return .mint }
        if r.contains("greed") { return .green }
        return .gray
    }
}

/// VIX from our proxy: { "price": 21.01, "change": 1.92, "changePercent": 10.06, "timestamp": "..." }
struct VixData: Decodable {
    let price: Double
    let change: Double
    let changePercent: Double
    let timestamp: String
    
    var changeColor: Color {
        change >= 0 ? .red : .green  // VIX up = bad (red), VIX down = good (green)
    }
    
    var changeText: String {
        let sign = change >= 0 ? "+" : ""
        return "\(sign)\(String(format: "%.2f", change)) (\(sign)\(String(format: "%.1f", changePercent))%)"
    }
}

// MARK: - API Client

class APIClient {
    static let shared = APIClient()
    
    private let baseURL = "http://127.0.0.1:8080"
    
    func fetchFearGreedIndex(completion: @escaping (WidgetData?) -> Void) {
        guard let url = URL(string: baseURL) else { completion(nil); return }
        
        URLSession.shared.dataTask(with: url) { data, _, error in
            guard error == nil, let data = data,
                  let widget = try? JSONDecoder().decode(WidgetData.self, from: data)
            else { completion(nil); return }
            completion(widget)
        }.resume()
    }
    
    func fetchVix(completion: @escaping (VixData?) -> Void) {
        guard let url = URL(string: "\(baseURL)/vix") else { completion(nil); return }
        
        URLSession.shared.dataTask(with: url) { data, _, error in
            guard error == nil, let data = data,
                  let vix = try? JSONDecoder().decode(VixData.self, from: data)
            else { completion(nil); return }
            completion(vix)
        }.resume()
    }
}

// MARK: - Timeline

struct FearGreedEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
    let vix: VixData?
    let family: WidgetFamily
}

struct Provider: TimelineProvider {
    private static let fallbackFG = WidgetData(score: 50, rating: "Neutral", timestamp: "Offline")
    
    func placeholder(in context: Context) -> FearGreedEntry {
        FearGreedEntry(date: Date(), data: Self.fallbackFG, vix: nil, family: context.family)
    }

    func getSnapshot(in context: Context, completion: @escaping (FearGreedEntry) -> ()) {
        completion(FearGreedEntry(date: Date(), data: Self.fallbackFG, vix: nil, family: context.family))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let now = Date()
        let family = context.family
        
        if family == .systemMedium {
            // Medium: fetch both Fear & Greed + VIX, refresh every 15 min
            APIClient.shared.fetchFearGreedIndex { fgData in
                APIClient.shared.fetchVix { vixData in
                    let entry = FearGreedEntry(
                        date: now,
                        data: fgData ?? Self.fallbackFG,
                        vix: vixData,
                        family: family
                    )
                    let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: now)!
                    completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
                }
            }
        } else {
            // Small: Fear & Greed only, refresh every 60 min
            APIClient.shared.fetchFearGreedIndex { fgData in
                let entry = FearGreedEntry(
                    date: now,
                    data: fgData ?? Self.fallbackFG,
                    vix: nil,
                    family: family
                )
                let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: now)!
                completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
            }
        }
    }
}

// MARK: - Small Widget View

struct SmallWidgetView: View {
    var entry: FearGreedEntry
    
    var body: some View {
        VStack(spacing: 6) {
            Text("Fear & Greed")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.secondary)
            
            Text("\(entry.data.score)")
                .font(.system(size: 42, weight: .heavy, design: .rounded))
                .foregroundColor(entry.data.ratingColor)
                .contentTransition(.numericText())
            
            Text(entry.data.rating.capitalized)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(entry.data.ratingColor)
            
            Text(entry.date, format: .dateTime.month(.twoDigits).day(.twoDigits).year().hour().minute())
                .font(.system(size: 9))
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Medium Widget View

struct MediumWidgetView: View {
    var entry: FearGreedEntry
    
    var body: some View {
        HStack(spacing: 0) {
            // Left: Fear & Greed
            VStack(spacing: 6) {
                Text("Fear & Greed")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.secondary)
                
                Text("\(entry.data.score)")
                    .font(.system(size: 42, weight: .heavy, design: .rounded))
                    .foregroundColor(entry.data.ratingColor)
                    .contentTransition(.numericText())
                
                Text(entry.data.rating.capitalized)
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(entry.data.ratingColor)
                
                Text(entry.date, format: .dateTime.month(.twoDigits).day(.twoDigits).year().hour().minute())
                    .font(.system(size: 9))
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity)
            
            Divider()
                .padding(.vertical, 12)
            
            // Right: VIX
            VStack(spacing: 6) {
                Text("VIX")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.secondary)
                
                if let vix = entry.vix {
                    Text(String(format: "%.2f", vix.price))
                        .font(.system(size: 42, weight: .heavy, design: .rounded))
                        .foregroundColor(vix.changeColor)
                        .contentTransition(.numericText())
                    
                    Text(vix.changeText)
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .foregroundColor(vix.changeColor)
                    
                    Text(entry.date, format: .dateTime.month(.twoDigits).day(.twoDigits).year().hour().minute())
                        .font(.system(size: 9))
                        .foregroundColor(.secondary)
                } else {
                    Text("--")
                        .font(.system(size: 42, weight: .heavy, design: .rounded))
                        .foregroundColor(.secondary)
                }
            }
            .frame(maxWidth: .infinity)
        }
    }
}

// MARK: - Widget Configuration

struct FearGreedWidgetExtension: Widget {
    let kind: String = "FearGreedWidgetExtension"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(macOS 14.0, *) {
                Group {
                    if entry.family == .systemSmall {
                        SmallWidgetView(entry: entry)
                    } else {
                        MediumWidgetView(entry: entry)
                    }
                }
                .containerBackground(.fill.tertiary, for: .widget)
            } else {
                Group {
                    if entry.family == .systemSmall {
                        SmallWidgetView(entry: entry)
                    } else {
                        MediumWidgetView(entry: entry)
                    }
                }
                .padding()
                .background()
            }
        }
        .configurationDisplayName("Market Sentiment")
        .description("CNN Fear & Greed Index + VIX")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
