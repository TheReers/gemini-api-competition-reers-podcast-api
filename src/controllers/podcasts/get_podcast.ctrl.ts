import isError from '../../utils/is_error.util'
import { Req, Res, validateReq } from '../../api_contracts/get_podcast.ctrl.contract'
import { renderError, renderSuccess } from '../../render'
import ReersError from '../../shared/reers_error'
import podcastModel from '../../models/podcast.model.server'
import { PodcastClient, PodcastStatus } from '../../models/podcast.model.client'

/**
 * Get Podcast ctrl
 */
export default async function getPodcastCtrl (req: Req): Res {
    const { user } = req

    const validation = validateReq(req.params)
    if (isError(validation) || !validation.data) {
        return renderError('Invalid request body', validation.error || new ReersError({
            message: 'Invalid request body',
            metadata: { message: 'All fields are required' },
            statusCode: 400
        }))
    }

    let podcast = await podcastModel.findOne({
        slug: req.params.slug,
        status: PodcastStatus.PUBLISHED,
        user: user?._id
    })
    if (!podcast) {
        // get demo/public podcast
        podcast = await podcastModel.findOne({
            slug: req.params.slug,
            status: PodcastStatus.PUBLISHED,
            $or: [
                { is_demo: true },
                { is_public: true }
            ]
        })

        if (!podcast) {
            return renderError('Podcast not found', undefined, { status: 404 })
        }
    }

    const podcastClient = podcast.toJSON() as unknown as PodcastClient
    return renderSuccess('Podcast retrieved successfully', podcastClient)
}
