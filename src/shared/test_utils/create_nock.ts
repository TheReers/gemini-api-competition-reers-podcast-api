import nock from 'nock'

export const createNock = (url = 'http://localhost', options = {}) => {
    const req = nock(url, options)

    return req
}
