import { Injectable, InternalServerErrorException } from "@nestjs/common"

@Injectable()
export class StorageService {
  private s3Client: any
  private bucketName: string

  constructor() {
    this.bucketName = process.env.MINIO_BUCKET || "gestao-os-attachments"
    
    // No Prisma real e produção de NestJS seria:
    // this.s3Client = new S3Client({
    //   endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
    //   region: 'us-east-1',
    //   credentials: {
    //     accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    //     secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    //   },
    //   forcePathStyle: true, // Necessário para conexões locais com MinIO
    // });
    
    this.s3Client = null
  }

  async uploadFile(
    tenantId: string, 
    fileName: string, 
    fileBuffer: Buffer, 
    mimeType: string
  ): Promise<{ key: string; url: string }> {
    const fileExtension = fileName.split(".").pop()
    const uniqueKey = `${tenantId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`

    try {
      // No Prisma/S3 real seria:
      // const command = new PutObjectCommand({
      //   Bucket: this.bucketName,
      //   Key: uniqueKey,
      //   Body: fileBuffer,
      //   ContentType: mimeType,
      // });
      // await this.s3Client.send(command);
      
      const endpoint = process.env.MINIO_ENDPOINT || "http://localhost:9000"
      const publicUrl = `${endpoint}/${this.bucketName}/${uniqueKey}`

      return {
        key: uniqueKey,
        url: publicUrl
      }
    } catch (err) {
      throw new InternalServerErrorException("Erro ao carregar o arquivo no MinIO")
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      // No S3 real seria:
      // const command = new DeleteObjectCommand({
      //   Bucket: this.bucketName,
      //   Key: key,
      // });
      // await this.s3Client.send(command);
      
      return true
    } catch (err) {
      throw new InternalServerErrorException("Erro ao remover o arquivo no MinIO")
    }
  }
}
