import path from 'path'
import { Db } from 'mongodb'
import { migrationConfig } from './config.migration'
import ReersError from '../shared/reers_error'
import envs from '../envs'
import logger from '../shared/logger'
import { ReersDBConnection } from '../shared/reers_db'

export interface Migration {
    default: (db: Db) => Promise<void>
}

export const runMigration = async () => {
    const db = new ReersDBConnection(envs.database.url)
    await db.connect()

    const unprocessedMigrations = migrationConfig.filter((migration) => !migration.processed)
    if (unprocessedMigrations.length === 0) {
        logger.info('No unprocessed migrations')
        return
    }

    logger.info(`Running ${unprocessedMigrations.length} unprocessed migrations`)

    for (const migration of unprocessedMigrations) {
        logger.info(`Running migration: ${migration.name}`)
        const filename = migration.file
        const filepath = path.join(process.cwd(), 'dist', 'src', 'migrations', filename)

        try {
            const migrationModule: Migration = await import(filepath)
            await migrationModule.default(db.db)
            logger.info(`Migration ${migration.name} complete`)
        } catch (err) {
            logger.error(new ReersError({
                message: `Error running migration ${migration.name}`,
                error: (err as Error),
                type: 'MIGRATION_ERROR'
            }))
        }

    }

    await db.disconnect()
    logger.info('Migration complete')
}
