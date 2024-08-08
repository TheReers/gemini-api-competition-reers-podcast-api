import { FilterQuery } from 'mongoose'
import isError from '../../utils/is_error.util'
import { Req, Res, validateReq } from '../../api_contracts/get_podcasts.ctrl.contract'
import { renderError, renderSuccess } from '../../render'
import ReersError from '../../shared/reers_error'
import podcastModel from '../../models/podcast.model.server'
import { PodcastClient, PodcastStatus } from '../../models/podcast.model.client'

/**
 * Get all Podcasts ctrl
 */
export default async function getPodcastsCtrl (req: Req): Res {
    const { user } = req
    const validation = validateReq(req.query)
    if (isError(validation) || !validation.data) {
        return renderError('Invalid request body', validation.error || new ReersError({
            message: 'Invalid request body',
            metadata: { message: 'All fields are required' },
            statusCode: 400
        }))
    }

    const body = validation.data
    // if user is not present, we get only demo podcasts(used for landing page)
    const filter: FilterQuery<PodcastClient> = user ? { user: user._id } : { is_demo: true }
    if (body.slug) {
        filter.slug = new RegExp(body.slug.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''), 'i')
    }

    if (body.unpublished) {
        filter.status = { $ne: PodcastStatus.PUBLISHED }
    }

    if (body.transcript) {
        filter.transcript = new RegExp(body.transcript, 'i')
    }

    let podcasts = await podcastModel.find(filter)
        .sort({ updated_at: -1, created_at: -1 })

   if (!podcasts.length && user) {
        // only possible if the user is logged but
        // 1. no podcasts matches the filter or
        // 2. user has no podcasts,  if user has no podcasts, we return demo podcasts
        const userHasPodcasts = await podcastModel.exists({ user: user._id })
        if (!userHasPodcasts) {
            podcasts = await podcastModel.find({ is_demo: true })
        }
    }

    return renderSuccess(
        'Podcasts retrieved successfully',
        podcasts.map(podcast => podcast.toJSON() as unknown as PodcastClient)
    )
}
