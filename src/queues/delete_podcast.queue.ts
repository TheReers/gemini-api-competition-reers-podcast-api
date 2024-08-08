import { Job } from 'bullmq'
import logger from '../shared/logger'
import { QueueNames } from './names'
import { deleteAudioFromCloudinary } from '../utils/save_and_delete_file'
import isError from '../utils/is_error.util'
import createQueue, { ProcessorResponse } from './generate_queue'

export interface DeletetePodcast {
    public_id: string
}


export const deletePodcastProcessor = async (job: Job<DeletetePodcast>): ProcessorResponse => {
    const { public_id } = job.data

    const start = Date.now()
    const deleteResult = await deleteAudioFromCloudinary(public_id)
    if (isError(deleteResult)) {
        logger.error(deleteResult.error)
        return { error: deleteResult.error }
    }

    const end = Date.now()
    logger.info('Podcast deleted successfully', {
        public_id,
        duration: end - start
    })

    return { data: {} }
}

const deletePodcastQueue = createQueue<DeletetePodcast>(
    QueueNames.DELETE_PODCAST,
    deletePodcastProcessor
)

export default deletePodcastQueue
