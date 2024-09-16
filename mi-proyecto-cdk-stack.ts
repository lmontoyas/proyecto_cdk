import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Instance, InstanceType, MachineImage, SecurityGroup, Vpc, UserData } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { Role, ArnPrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';

export class MiProyectoCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Parámetros
    const instanceName = new cdk.CfnParameter(this, 'InstanceName', {
      type: 'String',
      default: 'MV Reemplazar',
      description: 'Nombre de la instancia a crear'
    });

    const amiId = new cdk.CfnParameter(this, 'AMI', {
      type: 'String',
      default: 'ami-0aa28dab1f2852040',
      description: 'ID de AMI'
    });

    // VPC predeterminada
    const vpc = Vpc.fromLookup(this, 'VPC', { isDefault: true });

    // Grupo de seguridad
    const securityGroup = new SecurityGroup(this, 'InstanceSecurityGroup', {
      vpc,
      description: 'Permitir trafico SSH y HTTP desde cualquier lugar',
      allowAllOutbound: true
    });

    securityGroup.addIngressRule(cdk.aws_ec2.Peer.anyIpv4(), cdk.aws_ec2.Port.tcp(22), 'Permitir SSH');
    securityGroup.addIngressRule(cdk.aws_ec2.Peer.anyIpv4(), cdk.aws_ec2.Port.tcp(80), 'Permitir HTTP');

    // Definir el rol IAM utilizando el ARN proporcionado
    const ec2Role = Role.fromRoleArn(this, 'LabRole', 'arn:aws:iam::310702806895:role/LabRole');

    // Script de inicio que clona el repositorio
    const userDataScript = `
      cd /var/www/html/
      git clone https://github.com/utec-cc-2024-2-test/websimple.git
      git clone https://github.com/utec-cc-2024-2-test/webplantilla.git
      ls -l
    `;

    // Crear el UserData para la instancia
    const userData = UserData.forLinux();
    userData.addCommands(userDataScript);

    // Instancia EC2
    const ec2Instance = new Instance(this, 'EC2Instance', {
      instanceName: instanceName.valueAsString,
      vpc,
      instanceType: new InstanceType('t2.micro'),
      machineImage: MachineImage.genericLinux({ 'us-east-1': amiId.valueAsString }),
      securityGroup,
      keyName: 'vockey',
      role: ec2Role, // Asignar el rol a la instancia
      blockDevices: [{
        deviceName: '/dev/sda1',
        volume: cdk.aws_ec2.BlockDeviceVolume.ebs(20)
      }],
      userData: userData // Agregar el script de inicio (UserData)
    });

    // Outputs
    new CfnOutput(this, 'InstanceId', {
      description: 'ID de la instancia EC2',
      value: ec2Instance.instanceId
    });

    new CfnOutput(this, 'InstancePublicIP', {
      description: 'IP pública de la instancia',
      value: ec2Instance.instancePublicIp
    });

    new CfnOutput(this, 'websimpleURL', {
      description: 'URL de websimple',
      value: http://${ec2Instance.instancePublicIp}/websimple
    });

    new CfnOutput(this, 'webplantillaURL', {
      description: 'URL de webplantilla',
      value: http://${ec2Instance.instancePublicIp}/webplantilla
    });
  }
}