// src/core/domain/enums/mission.enums.ts
export enum MissionStatus {
    DRAFT = 'DRAFT',         // Mission en cours de création
    PUBLISHED = 'PUBLISHED', // Mission publiée et visible aux freelances
    IN_PROGRESS = 'IN_PROGRESS', // Mission a démarré avec un freelance
    COMPLETED = 'COMPLETED', // Mission terminée avec succès
    CANCELLED = 'CANCELLED'  // Mission annulée avant ou pendant
}

export enum MissionLocation {
    REMOTE = 'REMOTE',    // 100% télétravail
    ON_SITE = 'ON_SITE', // 100% sur site
    HYBRID = 'HYBRID'    // Mix télétravail et sur site
}

export enum MissionPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export enum MissionVisibility {
    PUBLIC = 'PUBLIC',   // Visible par tous les freelances
    PRIVATE = 'PRIVATE', // Visible uniquement par invitation
    DRAFT = 'DRAFT'     // Visible uniquement par le créateur
}