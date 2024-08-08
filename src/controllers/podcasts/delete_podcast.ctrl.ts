import isError from '../../utils/is_error.util'
import { Req, Res, validateReq } from '../../api_contracts/get_podcast.ctrl.contract'
import { renderError, renderSuccess } from '../../render'
import ReersError from '../../shared/reers_error'
import podcastModel from '../../models/podcast.model.server'
import { PodcastClient, PodcastStatus } from '../../models/podcast.model.client'
import { deletePodcastQueue } from '../../queues'
import { QueueNames } from '../../queues/names'
import envs from '../../envs'

/**
 * Delete Podcast ctrl
 */
export default async function getPodcastCtrl (req: Req): Res {
    const { user } = req
    if (!user) {
        return renderError('Unauthorized', undefined, { status: 401 })
    }

    const validation = validateReq(req.params)
    if (isError(validation) || !validation.data) {
        return renderError('Invalid request body', validation.error || new ReersError({
            message: 'Invalid request body',
            metadata: { message: 'All fields are required' },
            statusCode: 400
        }))
    }

    const podcast = await podcastModel.findOneAndDelete({
        slug: req.params.slug,
        user: user._id,
        status: PodcastStatus.PUBLISHED
    })

    if (!podcast) {
        return renderError('Podcast not found', undefined, { status: 404 })
    }

    const otherPodcast = await podcastModel.findOne({ slug: podcast.slug, status: PodcastStatus.PUBLISHED })
    if (!otherPodcast && podcast.uploader_public_id && !envs.isTest) {
        // add the podcast audio deletion to the queue
        await deletePodcastQueue.add(
            `${QueueNames.DELETE_PODCAST}:${podcast.uploader_public_id}`,
            { public_id: podcast.uploader_public_id },
        )
    }

    const podcastClient = podcast.toJSON() as unknown as PodcastClient
    return renderSuccess('Podcast deleted successfully', podcastClient)
}
