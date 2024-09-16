#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MiProyectoCdkStack } from '../lib/mi-proyecto-cdk-stack';
import { DefaultStackSynthesizer } from 'aws-cdk-lib';

const defaultStackSynthesizer = new DefaultStackSynthesizer({
  // Define el nombre del bucket de S3 que se usará para almacenar los activos de archivos
  fileAssetsBucketName:
    "cdk-${Qualifier}-assets-${AWS::AccountId}-${AWS::Region}",
  bucketPrefix: "",

  // Define el nombre del repositorio de ECR (Elastic Container Registry) para almacenar los activos de Docker
  //imageAssetsRepositoryName:
  //  "cdk-${Qualifier}-container-assets-${AWS::AccountId}-${AWS::Region}",

  // ARN del rol que la CLI y la Pipeline asumirán para desplegar los recursos
  deployRoleArn: "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/LabRole",
  deployRoleExternalId: "",

  // ARN del rol utilizado para publicar los activos de archivos)
  fileAssetPublishingRoleArn:
    "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/LabRole",
  fileAssetPublishingExternalId: "",

  // ARN del rol utilizado para publicar los activos de Docker
  //imageAssetPublishingRoleArn:
  //  "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/LabRole",
  //imageAssetPublishingExternalId: "",

  // ARN del rol que se pasa a CloudFormation para ejecutar los despliegues
  cloudFormationExecutionRole:
    "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/LabRole",

  // ARN del rol utilizado para buscar información de contexto en el entorno
  lookupRoleArn: "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/LabRole",
  lookupRoleExternalId: "",

  // Nombre del parámetro SSM que describe la versión del stack de bootstrap
  bootstrapStackVersionSsmParameter: "/cdk-bootstrap/${Qualifier}/version",

  // agrega una regla a cada plantilla que verifica la versión del stack de bootstrap requerida
  generateBootstrapVersionRule: true,
});

const app = new cdk.App();
new MiProyectoCdkStack(app, 'MiProyectoCdkStack', {
  env: {
    account: '310702806895', // ID de cuenta
    region: 'us-east-1', // region
  },

  synthesizer: defaultStackSynthesizer
});


