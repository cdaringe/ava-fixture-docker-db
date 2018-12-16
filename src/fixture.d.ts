import Docker from 'dockerode';
export interface DbContextDbConfig {
    dockerImage: string;
    port: number;
    username: 'postgres';
    password: 'postgres';
    database: 'postgres';
}
export interface DbContext {
    dbContainer: Docker.Container;
    dbConfig: DbContextDbConfig;
}
export declare function imageExists(imageName: string): Promise<boolean>;
export declare function purgeContainer(container: Docker.Container): Promise<void>;
export declare const db: {
    setup<C>(ctx: C & DbContext, userDbConfig?: DbContextDbConfig | undefined, dockerodeConfig?: Docker.ContainerCreateOptions | undefined): Promise<void>;
    teardown(ctx: DbContext): Promise<void>;
};
//# sourceMappingURL=fixture.d.ts.map