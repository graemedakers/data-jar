
export interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    activeJarId: string | null;
    memberships: JarMember[];

    // Virtual fields added by api/auth/me
    jarType?: 'ROMANTIC' | 'SOCIAL';
    jarName?: string | null;
    isPremium?: boolean;
    hasPaid?: boolean;
    isCreator?: boolean;
    hasPartner?: boolean;
    xp?: number;
    level?: number;

    [key: string]: any;
}

export interface JarMember {
    id: string;
    userId: string;
    jarId: string;
    role: 'ADMIN' | 'MEMBER';
    jar?: Jar;
}

export interface Jar {
    id: string;
    name: string;
    type: 'ROMANTIC' | 'SOCIAL';
    ownerId: string;
    members?: JarMember[];
    ideas?: Idea[];
}

export interface Idea {
    id: string;
    title: string;
    description?: string;
    selectedAt?: string | Date | null;
    [key: string]: any;
}
