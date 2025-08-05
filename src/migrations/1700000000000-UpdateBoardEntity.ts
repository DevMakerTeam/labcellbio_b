import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBoardEntity1700000000000 implements MigrationInterface {
    name = 'UpdateBoardEntity1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // writer_name 컬럼을 author로 변경
        await queryRunner.query(`ALTER TABLE \`board\` CHANGE \`writer_name\` \`author\` varchar(100) NOT NULL`);
        
        // author_image 컬럼 추가
        await queryRunner.query(`ALTER TABLE \`board\` ADD \`author_image\` varchar(500) NULL`);
        
        // description 컬럼 추가
        await queryRunner.query(`ALTER TABLE \`board\` ADD \`description\` varchar(500) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // description 컬럼 삭제
        await queryRunner.query(`ALTER TABLE \`board\` DROP COLUMN \`description\``);
        
        // author_image 컬럼 삭제
        await queryRunner.query(`ALTER TABLE \`board\` DROP COLUMN \`author_image\``);
        
        // author 컬럼을 writer_name으로 되돌리기
        await queryRunner.query(`ALTER TABLE \`board\` CHANGE \`author\` \`writer_name\` varchar(100) NOT NULL`);
    }
} 