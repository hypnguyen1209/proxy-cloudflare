addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

const fixCORS = hd => {
    hd.set("Access-Control-Allow-Origin", '*')
    hd.set('Access-Control-Request-Method', 'GET,POST,PUT,DELETE,OPTIONS')
    hd.set('Access-Control-Allow-Methods', '*')
    hd.set('Access-Control-Allow-Headers', '*')
    hd.delete("X-Content-Type-Options")
    return hd
}

const mapToObj = map => {
    return Array.from(map)
        .reduce((obj, [key, value]) => (
            Object.assign(obj, { [key]: value })
        ), { })
}

const handleRequest = async request => {
    try {
        let BASE_URL = ''
        if (request.url.includes('?')) {
            BASE_URL = new URL(decodeURIComponent(request.url.split('?')[1]))
            let headers = mapToObj(request.headers)
            let setHeader = new Headers()
            setHeader.set('Origin', BASE_URL.origin)
            Object.keys(headers).forEach(e => {
                if (!e.includes('cf-') && !e.includes('x-real-ip')) {
                    setHeader.set(`${e}`, headers[e])
                }
            })
            let newRequest = new Request(request, {
                'headers': setHeader
            })
            let response = await fetch(BASE_URL.href, newRequest)
            let body = request.method != 'OPTIONS' ? await response.arrayBuffer() : null
            let myHeaders = new Headers(response.headers)
            myHeaders = fixCORS(myHeaders)
            const init = {
                headers: myHeaders,
                status: response.status,
                statusText: response.statusText
            }
            return new Response(body, init)
        }
        return new Response(`` +
            `PROXY EVERYWHERE
Donate: https://paypal.me/hiep12092001/5
Limits: 100000 requests/day, 1000 requests/10 minutes
Usage: ?http://example.com/123`.trim(), {
            headers: {
                "content-type": "text/plain"
            }
        })
    } catch (error) {
        return new Response(`{"status": false, "error": "${error.toString()}"}`, {
            headers: {
                "content-type": "application/json"
            },
            status: 400,
            statusText: 'Bad Request'
        })
    }
}
