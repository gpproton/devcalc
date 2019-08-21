BinaryParser = function(e, t) {
    this.bigEndian = e, this.allowExceptions = t
};
with({
    p: BinaryParser.prototype
}) {
    p.encodeFloat = function(e, t, n) {
        var i = Math.pow(2, n - 1) - 1,
            s = -i + 1,
            o = i,
            u = s - t,
            a = isNaN(p = parseFloat(e)) || p == -Infinity || p == +Infinity ? p : 0,
            f = 0,
            l = 2 * i + 1 + t + 3,
            c = new Array(l),
            h = (p = a !== 0 ? 0 : p) < 0,
            p = Math.abs(p),
            d = Math.floor(p),
            v = p - d,
            m, g, y, b, w;
        for (m = l; m; c[--m] = 0);
        for (m = i + 2; d && m; c[--m] = d % 2, d = Math.floor(d / 2));
        for (m = i + 1; v > 0 && m;
            (c[++m] = ((v *= 2) >= 1) - 0) && --v);
        for (m = -1; ++m < l && !c[m];);
        if (c[(g = t - 1 + (m = (f = i + 1 - m) >= s && f <= o ? m + 1 : i + 1 - (f = s - 1))) + 1]) {
            if (!(y = c[g]))
                for (b = g + 2; !y && b < l; y = c[b++]);
            for (b = g + 1; y && --b >= 0;
                (c[b] = !c[b] - 0) && (y = 0));
        }
        for (m = m - 2 < 0 ? -1 : m - 3; ++m < l && !c[m];);
        (f = i + 1 - m) >= s && f <= o ? ++m : f < s && (f != i + 1 - l && f < u && this.warn("encodeFloat::float underflow"), m = i + 1 - (f = s - 1));
        (d || a !== 0) && (this.warn(d ? "encodeFloat::float overflow" : "encodeFloat::" + a), f = o + 1, m = i + 2, a == -Infinity ? h = 1 : isNaN(a) && (c[m] = 1));
        for (p = Math.abs(f + i), b = n + 1, w = ""; --b; w = p % 2 + w, p = p >>= 1);
        for (p = 0, b = 0, m = (w = (h ? "1" : "0") + w + c.slice(m, m + t).join("")).length, r = []; m; p += (1 << b) * w.charAt(--m), b == 7 && (r[r.length] = String.fromCharCode(p), p = 0), b = (b + 1) % 8);
        r[r.length] = p ? String.fromCharCode(p) : "";
        return (this.bigEndian ? r.reverse() : r).join("")
    };
    p.encodeInt = function(e, t, n) {
        var r = Math.pow(2, t),
            i = [];
        (e >= r || e < -(r >> 1)) && this.warn("encodeInt::overflow") && (e = 0);
        e < 0 && (e += r);
        for (; e; i[i.length] = String.fromCharCode(e % 256), e = Math.floor(e / 256));
        for (t = -(-t >> 3) - i.length; t--; i[i.length] = "\0");
        return (this.bigEndian ? i.reverse() : i).join("")
    };
    p.decodeFloat = function(e, t, n) {
        var r = ((r = new this.Buffer(this.bigEndian, e)).checkBuffer(t + n + 1), r),
            i = Math.pow(2, n - 1) - 1,
            s = r.readBits(t + n, 1),
            o = r.readBits(t, n),
            u = 0,
            a = 2,
            f = r.buffer.length + (-t >> 3) - 1,
            l, c, h;
        do
            for (l = r.buffer[++f], c = t % 8 || 8, h = 1 << c; h >>= 1; l & h && (u += 1 / a), a *= 2); while (t -= c);
        return o == (i << 1) + 1 ? u ? NaN : s ? -Infinity : +Infinity : (1 + s * -2) * (o || u ? !o ? Math.pow(2, -i + 1) * u : Math.pow(2, o - i) * (1 + u) : 0)
    };
    p.decodeInt = function(e, t, n) {
        var r = new this.Buffer(this.bigEndian, e),
            i = r.readBits(0, t),
            s = Math.pow(2, t);
        return n && i >= s / 2 ? i - s : i
    };
    with({
        p: (p.Buffer = function(e, t) {
            this.bigEndian = e || 0, this.buffer = [], this.setBuffer(t)
        }).prototype
    }) {
        p.readBits = function(e, t) {
            function n(e, t) {
                for (++t; --t; e = ((e %= 2147483647 + 1) & 1073741824) == 1073741824 ? e * 2 : (e - 1073741824) * 2 + 2147483647 + 1);
                return e
            }
            if (e < 0 || t <= 0) return 0;
            this.checkBuffer(e + t);
            for (var r, i = e % 8, s = this.buffer.length - (e >> 3) - 1, o = this.buffer.length + (-(e + t) >> 3), u = s - o, a = (this.buffer[s] >> i & (1 << (u ? 8 - i : t)) - 1) + (u && (r = (e + t) % 8) ? (this.buffer[o++] & (1 << r) - 1) << (u-- << 3) - i : 0); u; a += n(this.buffer[o++], (u-- << 3) - i));
            return a
        };
        p.setBuffer = function(e) {
            if (e) {
                for (var t, n = t = e.length, r = this.buffer = new Array(t); n; r[t - n] = e.charCodeAt(--n));
                this.bigEndian && r.reverse()
            }
        };
        p.hasNeededBits = function(e) {
            return this.buffer.length >= -(-e >> 3)
        };
        p.checkBuffer = function(e) {
            if (!this.hasNeededBits(e)) throw new Error("checkBuffer::missing bytes")
        }
    }
    p.warn = function(e) {
        if (this.allowExceptions) throw new Error(e);
        return 1
    };
    p.toSmall = function(e) {
        return this.decodeInt(e, 8, true)
    };
    p.fromSmall = function(e) {
        return this.encodeInt(e, 8, true)
    };
    p.toByte = function(e) {
        return this.decodeInt(e, 8, false)
    };
    p.fromByte = function(e) {
        return this.encodeInt(e, 8, false)
    };
    p.toShort = function(e) {
        return this.decodeInt(e, 16, true)
    };
    p.fromShort = function(e) {
        return this.encodeInt(e, 16, true)
    };
    p.toWord = function(e) {
        return this.decodeInt(e, 16, false)
    };
    p.fromWord = function(e) {
        return this.encodeInt(e, 16, false)
    };
    p.toInt = function(e) {
        return this.decodeInt(e, 32, true)
    };
    p.fromInt = function(e) {
        return this.encodeInt(e, 32, true)
    };
    p.toDWord = function(e) {
        return this.decodeInt(e, 32, false)
    };
    p.fromDWord = function(e) {
        return this.encodeInt(e, 32, false)
    };
    p.toFloat = function(e) {
        return this.decodeFloat(e, 23, 8)
    };
    p.fromFloat = function(e) {
        return this.encodeFloat(e, 23, 8)
    };
    p.toDouble = function(e) {
        return this.decodeFloat(e, 52, 11)
    };
    p.fromDouble = function(e) {
        return this.encodeFloat(e, 52, 11)
    }
}