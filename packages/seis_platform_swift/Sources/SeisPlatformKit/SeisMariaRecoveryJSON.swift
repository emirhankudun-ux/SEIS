import Foundation

// Recovery-wire-only JSON reader. Integer-only numbers match this schema;
// limits and duplicate-key rejection apply before values enter presentation.
// Foundation decodes string escapes, rather than implementing Unicode ourselves.
indirect enum SeisMariaRecoveryJSON {
    case object([String: SeisMariaRecoveryJSON])
    case array([SeisMariaRecoveryJSON])
    case string(String)
    case integer(Int)
    case boolean(Bool)
    case null
}

struct SeisMariaRecoveryJSONReader {
    private let bytes: [UInt8]
    private var index = 0

    init(_ data: Data) throws {
        guard !data.isEmpty, data.count <= SeisMariaRecoveryDecoder.maximumBytes else {
            throw SeisMariaRecoveryError.invalidPayloadSize
        }
        guard String(data: data, encoding: .utf8) != nil else {
            throw SeisMariaRecoveryError.invalidJSON
        }
        bytes = Array(data)
    }

    mutating func read() throws -> SeisMariaRecoveryJSON {
        let result = try value(depth: 0)
        whitespace()
        guard index == bytes.count else { throw SeisMariaRecoveryError.invalidJSON }
        return result
    }

    private mutating func whitespace() {
        while index < bytes.count, [9, 10, 13, 32].contains(bytes[index]) { index += 1 }
    }

    private mutating func consume(_ byte: UInt8) -> Bool {
        whitespace()
        guard index < bytes.count, bytes[index] == byte else { return false }
        index += 1
        return true
    }

    private mutating func value(depth: Int) throws -> SeisMariaRecoveryJSON {
        whitespace()
        guard depth <= 8, index < bytes.count else { throw SeisMariaRecoveryError.invalidJSON }
        switch bytes[index] {
        case 123: // {
            index += 1
            var object: [String: SeisMariaRecoveryJSON] = [:]
            if consume(125) { return .object(object) }
            repeat {
                whitespace()
                let key = try string()
                guard object[key] == nil, object.count < 16, consume(58) else {
                    throw SeisMariaRecoveryError.invalidJSON
                }
                object[key] = try value(depth: depth + 1)
                if consume(125) { return .object(object) }
            } while consume(44)
            throw SeisMariaRecoveryError.invalidJSON
        case 91: // [
            index += 1
            var array: [SeisMariaRecoveryJSON] = []
            if consume(93) { return .array(array) }
            repeat {
                guard array.count < 256 else { throw SeisMariaRecoveryError.invalidSchema }
                array.append(try value(depth: depth + 1))
                if consume(93) { return .array(array) }
            } while consume(44)
            throw SeisMariaRecoveryError.invalidJSON
        case 34: return .string(try string())
        case 116: try literal("true"); return .boolean(true)
        case 102: try literal("false"); return .boolean(false)
        case 110: try literal("null"); return .null
        case 45, 48...57:
            let start = index
            if bytes[index] == 45 { index += 1 }
            guard index < bytes.count, (48...57).contains(bytes[index]) else {
                throw SeisMariaRecoveryError.invalidJSON
            }
            if bytes[index] == 48 {
                index += 1
            } else {
                while index < bytes.count, (48...57).contains(bytes[index]) { index += 1 }
            }
            guard let number = Int(String(decoding: bytes[start..<index], as: UTF8.self)) else {
                throw SeisMariaRecoveryError.invalidSchema
            }
            return .integer(number)
        default: throw SeisMariaRecoveryError.invalidJSON
        }
    }

    private mutating func literal(_ text: String) throws {
        let expected = Array(text.utf8)
        guard index + expected.count <= bytes.count,
              bytes[index..<(index + expected.count)].elementsEqual(expected) else {
            throw SeisMariaRecoveryError.invalidJSON
        }
        index += expected.count
    }

    private mutating func string() throws -> String {
        guard index < bytes.count, bytes[index] == 34 else { throw SeisMariaRecoveryError.invalidJSON }
        let start = index
        index += 1
        while index < bytes.count {
            let byte = bytes[index]
            index += 1
            if byte == 92 { // skip an escaped byte; Foundation validates its value
                guard index < bytes.count else { throw SeisMariaRecoveryError.invalidJSON }
                index += 1
            } else if byte == 34 {
                do {
                    let decoded = try JSONDecoder().decode(String.self, from: Data(bytes[start..<index]))
                    guard decoded.unicodeScalars.count <= 512 else { throw SeisMariaRecoveryError.invalidSchema }
                    return decoded
                } catch {
                    throw SeisMariaRecoveryError.invalidJSON
                }
            } else if byte < 32 {
                throw SeisMariaRecoveryError.invalidJSON
            }
        }
        throw SeisMariaRecoveryError.invalidJSON
    }
}
