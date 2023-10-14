import {
  ProtocolDomain,
  ProtocolMetadata,
  protocolVersionsModel,
} from '@/data/protocols';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { Markdown } from '@/ui/components/Markdown';
import { CopyableAnchor } from '@/ui/components/CopyableAnchor';
import { DimText } from '@/ui/components/DimText';
import Image from 'next/image';
import { Protocol } from '@/third-party/protocol-schema';
import { resolveMaybeQualifiedRef } from '@/data/ProtocolModel';
import {
  ProtocolImplementationData,
  getProtocolImplementationData,
} from '../data';
import { Card } from '@/ui/components/Card';
import { Tag } from '@/ui/components/Tag';
import { GitHubLineLink } from '@/ui/components/GitHubLineLink';

export default async function Page({
  params: { version, domain: domainName },
}: {
  params: {
    version: string;
    domain: string;
  };
}) {
  const protocolVersion =
    await protocolVersionsModel.protocolVersionBySlug(version);
  if (!protocolVersion) {
    return notFound();
  }
  const protocol = await protocolVersion.protocol();
  const domain = protocol.domain(domainName);
  if (!domain) {
    return notFound();
  }
  const protocolImplementationData = await getProtocolImplementationData(
    protocol.protocol,
  );
  const protocolMetadata = await protocolVersion.metadata();
  return (
    <main className="p-4 flex-grow">
      {
        <Domain
          domain={domain}
          protocolImplementationData={protocolImplementationData}
          protocolMetadata={protocolMetadata}
        />
      }
    </main>
  );
}

function FeatureStatusTags({ for: for_ }: { for: Protocol.Feature }) {
  return (
    <>
      {'experimental' in for_ && for_.experimental && (
        <span className="bg-red-300 dark:bg-red-500 rounded-lg px-2 py-1 text-sm text-gray-700 dark:text-gray-800 font-sans font-normal">
          Experimental
        </span>
      )}
      {'deprecated' in for_ && for_.deprecated && (
        <span className="bg-orange-300 dark:bg-orange-500 rounded-lg px-2 py-1 text-sm text-gray-700 dark:text-gray-800 font-sans font-normal">
          Deprecated
        </span>
      )}
    </>
  );
}

async function Domain({
  domain,
  protocolImplementationData,
  protocolMetadata,
}: {
  domain: ProtocolDomain;
  protocolImplementationData: ProtocolImplementationData;
  protocolMetadata: ProtocolMetadata;
}) {
  return (
    <>
      <TocCard
        domain={domain}
        protocolImplementationData={protocolImplementationData}
        protocolMetadata={protocolMetadata}
      />
      {domain.commands != null && domain.commands?.length !== 0 && (
        <>
          <h2 className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto">
            Methods
          </h2>
          <Card>
            {domain.commands.map((command, index) => (
              <div key={command.name} className="group">
                {/* add horizontal separator if not the first item */}
                {index > 0 && <hr className="my-4" />}
                <MemberHeading
                  kind="method"
                  member={command}
                  domain={domain.domain}
                  protocolImplementationData={protocolImplementationData}
                  protocolMetadata={protocolMetadata}
                />
                <MemberDescription member={command} />
                <MemberParameters
                  member={command}
                  domain={domain.domain}
                  versionSlug={protocolMetadata.versionSlug}
                />
                <MethodReturnObject
                  command={command}
                  domain={domain.domain}
                  versionSlug={protocolMetadata.versionSlug}
                />
              </div>
            ))}
          </Card>
        </>
      )}
      {domain.events != null && domain.events?.length !== 0 && (
        <>
          <h2 className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto">
            Events
          </h2>
          <Card>
            {domain.events.map((event, index) => (
              <div key={event.name} className="group">
                {/* add horizontal separator if not the first item */}
                {index > 0 && <hr className="my-4" />}
                <MemberHeading
                  kind="event"
                  member={event}
                  domain={domain.domain}
                  protocolImplementationData={protocolImplementationData}
                  protocolMetadata={protocolMetadata}
                />
                <MemberDescription member={event} />
                <MemberParameters
                  member={event}
                  domain={domain.domain}
                  versionSlug={protocolMetadata.versionSlug}
                />
              </div>
            ))}
          </Card>
        </>
      )}
      {domain.types != null && domain.types.length !== 0 && (
        <>
          <h2 className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto">
            Types
          </h2>
          <Card>
            {domain.types.map((type, index) => (
              <div key={type.id} className="group">
                {/* add horizontal separator if not the first item */}
                {index > 0 && <hr className="my-4" />}
                <MemberHeading
                  kind="type"
                  member={type}
                  domain={domain.domain}
                  protocolImplementationData={protocolImplementationData}
                  protocolMetadata={protocolMetadata}
                />
                <MemberDescription member={type} />
                <p>
                  Type:{' '}
                  <TypeLink
                    type={type}
                    domain={domain.domain}
                    versionSlug={protocolMetadata.versionSlug}
                  />
                </p>
                <TypeDetail type={type} />
                <TypeProperties
                  type={type}
                  domain={domain.domain}
                  versionSlug={protocolMetadata.versionSlug}
                />
              </div>
            ))}
          </Card>
        </>
      )}
    </>
  );
}

function TocCard({
  domain,
  protocolImplementationData,
  protocolMetadata,
}: {
  domain: ProtocolDomain;
  protocolImplementationData: ProtocolImplementationData;
  protocolMetadata: ProtocolMetadata;
}) {
  return (
    <Card
      title={`${domain.domain} Domain`}
      topContent={
        <DomainExternalLinks
          domain={domain.domain}
          protocolMetadata={protocolMetadata}
        />
      }
    >
      {'description' in domain && domain.description && (
        <Markdown>{domain.description}</Markdown>
      )}
      <FeatureStatusTags for={domain} />
      <MemberLinks
        kind="method"
        members={domain.commands}
        domain={domain.domain}
        protocolImplementationData={protocolImplementationData}
      >
        Methods
      </MemberLinks>
      <MemberLinks
        kind="event"
        members={domain.events}
        domain={domain.domain}
        protocolImplementationData={protocolImplementationData}
      >
        Events
      </MemberLinks>
      <MemberLinks
        kind="type"
        members={domain.types}
        domain={domain.domain}
        protocolImplementationData={protocolImplementationData}
      >
        Types
      </MemberLinks>
    </Card>
  );
}

function TypeLink({
  type,
  domain,
  versionSlug,
  failIfEnum,
}: {
  type: Protocol.ProtocolType | undefined;
  domain: string;
  versionSlug: string;
  failIfEnum?: boolean;
}) {
  if (!type) {
    return <></>;
  }
  if (failIfEnum && 'enum' in type && type.enum) {
    throw new Error(`Unexpected enum in this context: ${JSON.stringify(type)}`);
  }
  if ('$ref' in type) {
    {
      const { $ref } = type;
      const { domain: resolvedDomain, localName } = resolveMaybeQualifiedRef({
        $ref,
        domain,
      });
      return (
        <Link
          href={`/devtools-protocol/${encodeURIComponent(
            versionSlug,
          )}/${encodeURIComponent(resolvedDomain)}#type-${encodeURIComponent(
            localName,
          )}`}
          className="text-blue-600 hover:underline font-mono font-bold"
        >
          {$ref}
        </Link>
      );
    }
  }
  switch (type.type) {
    case 'array':
      return (
        <code className="font-mono font-bold">
          array[{' '}
          <TypeLink
            type={type.items}
            domain={domain}
            versionSlug={versionSlug}
            failIfEnum
          />{' '}
          ]
        </code>
      );
    case 'object':
    case 'boolean':
    case 'integer':
    case 'string':
    case 'number':
    case 'any':
      return <code className="font-mono font-bold">{type.type}</code>;
    default: {
      throw new Error(`Unhandled type: ${JSON.stringify(type as never)}`);
    }
  }
}

function TypeDetail({ type }: { type: Protocol.ProtocolType }) {
  if (!type) {
    return <></>;
  }
  if ('$ref' in type) {
    return <></>;
  }
  switch (type.type) {
    case 'string':
      if (type.enum) {
        return (
          <>
            <p>
              Allowed values:{' '}
              {type.enum.map((value, index) => (
                <React.Fragment key={value}>
                  {index > 0 && ', '}
                  <code className="font-mono">{value}</code>
                </React.Fragment>
              ))}
            </p>
          </>
        );
      }
      return <></>;
    case 'array':
    case 'object':
    case 'boolean':
    case 'integer':
    case 'number':
    case 'any':
      return <></>;
    default: {
      throw new Error(`Unhandled type: ${JSON.stringify(type as never)}`);
    }
  }
}

function PropsTable({
  items,
  domain,
  versionSlug,
}: {
  items: Array<Protocol.PropertyType>;
  domain: string;
  versionSlug: string;
}) {
  return (
    <>
      {items.map((item) => (
        <React.Fragment key={item.name}>
          <div className="flex flex-row">
            <div className="w-2/5 text-end me-4 mb-4">
              <code className="font-mono">{item.name}</code>
              {'optional' in item && item.optional && (
                <>
                  <br />
                  <Tag>Optional</Tag>
                </>
              )}{' '}
            </div>
            <div className="w-3/5 mb-4">
              <TypeLink domain={domain} type={item} versionSlug={versionSlug} />
              {'description' in item && item.description && (
                <Markdown>{item.description}</Markdown>
              )}
              <TypeDetail type={item} />
              <FeatureStatusTags for={item} />
            </div>
          </div>
        </React.Fragment>
      ))}
    </>
  );
}

function MemberLinks({
  kind,
  members,
  domain,
  children,
  protocolImplementationData,
}: {
  kind: 'method' | 'event' | 'type';
  members:
    | Array<
        {
          experimental?: boolean;
          deprecated?: boolean;
        } & ({ name: string } | { id: string })
      >
    | undefined;
  domain: string;
  children: ReactNode;
  protocolImplementationData: ProtocolImplementationData;
}) {
  return (
    members != null &&
    members.length !== 0 && (
      <>
        <h3 className="font-bold text-lg mt-4 mb-2">{children}</h3>
        <ul>
          {members.map((member) => {
            const key = 'name' in member ? member.name : member.id;
            return (
              <li key={key}>
                <Link
                  href={`#${kind}-${encodeURIComponent(key)}`}
                  className="text-blue-600 hover:underline font-mono"
                >
                  <DimText>{domain}.</DimText>
                  {key}
                </Link>{' '}
                <FeatureStatusTags for={member} />
                <ImplementationLinkForMember
                  domain={domain}
                  implementationId="hermes"
                  kind={kind}
                  memberKey={key}
                  protocolImplementationData={protocolImplementationData}
                  small
                />
              </li>
            );
          })}
        </ul>
      </>
    )
  );
}

function MemberHeading({
  kind,
  member,
  domain,
  protocolImplementationData,
  protocolMetadata,
}: {
  kind: 'method' | 'event' | 'type';
  member: {
    experimental?: boolean;
    deprecated?: boolean;
  } & ({ name: string } | { id: string });
  domain: string;
  protocolImplementationData: ProtocolImplementationData;
  protocolMetadata: ProtocolMetadata;
}) {
  const key = 'name' in member ? member.name : member.id;
  return (
    <>
      <MemberExternalLinks
        kind={kind}
        memberKey={key}
        domain={domain}
        protocolImplementationData={protocolImplementationData}
        protocolMetadata={protocolMetadata}
      />
      <h3
        className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto font-mono"
        id={`${kind}-${encodeURIComponent(key)}`}
      >
        <DimText>{domain}.</DimText>
        {key} <FeatureStatusTags for={member} />
        <CopyableAnchor href={`#${kind}-${encodeURIComponent(key)}`} />
      </h3>
    </>
  );
}

function DomainExternalLinks({
  domain,
  protocolMetadata,
}: {
  domain: string;
  protocolMetadata: ProtocolMetadata;
}) {
  const upstreamVersionSlug = protocolMetadata.isAvailableUpstream
    ? protocolMetadata.versionSlug
    : 'tot';
  // TODO: Check against our local copy of the `tot` version to see if this particular domain is available.

  const cdpUrl = `https://chromedevtools.github.io/devtools-protocol/${encodeURIComponent(
    upstreamVersionSlug,
  )}/${encodeURIComponent(domain)}`;
  return (
    <div className="float-right ml-1">
      <a href={cdpUrl} target="cdp-reference" title="View in CDP docs">
        <Image
          src="/images/chrome-devtools-circle-responsive.svg"
          width={24}
          height={24}
          alt="Chrome DevTools"
          about=""
        />
      </a>
    </div>
  );
}

function ImplementationLinkForMember({
  implementationId,
  kind,
  domain,
  memberKey,
  protocolImplementationData,
  small,
}: {
  implementationId: 'hermes';
  kind: 'method' | 'event' | 'type';
  domain: string;
  memberKey: string;
  protocolImplementationData: ProtocolImplementationData;
  small?: boolean;
}) {
  const references =
    protocolImplementationData.referencesByImplementationId.get(
      implementationId,
    )?.references[
      kind === 'type' ? 'types' : kind === 'method' ? 'commands' : 'events'
    ]?.[domain + '.' + memberKey] ?? [];
  const primaryReference = references[0];
  let linkContents: ReactNode;

  switch (implementationId) {
    case 'hermes': {
      linkContents = (
        <Image
          src="/images/hermes-logo.svg"
          width={small ? 20 : 24}
          height={small ? 20 : 24}
          alt="Hermes"
          title="Referenced in Hermes CDPHandler"
          className="inline-block"
        />
      );
      break;
    }
    default:
      throw new Error(`Unhandled implementationId: ${implementationId}`);
  }
  if (!primaryReference) {
    return <></>;
  }
  if (primaryReference.github) {
    return (
      <GitHubLineLink
        owner={primaryReference.github.owner}
        repo={primaryReference.github.repo}
        line={primaryReference.line}
        commitRef={primaryReference.github.commitSha}
        path={primaryReference.github.path}
      >
        {linkContents}
      </GitHubLineLink>
    );
  }
  return <>{linkContents}</>;
}

function MemberExternalLinks({
  kind,
  memberKey,
  domain,
  protocolImplementationData,
  protocolMetadata,
}: {
  kind: 'method' | 'event' | 'type';
  memberKey: string;
  domain: string;
  protocolImplementationData: ProtocolImplementationData;
  protocolMetadata: ProtocolMetadata;
}) {
  const upstreamVersionSlug = protocolMetadata.isAvailableUpstream
    ? protocolMetadata.versionSlug
    : 'tot';
  // TODO: Check against our local copy of the `tot` version to see if this particular member is available.

  const cdpUrl = `https://chromedevtools.github.io/devtools-protocol/${encodeURIComponent(
    upstreamVersionSlug,
  )}/${encodeURIComponent(domain)}#${encodeURIComponent(
    kind,
  )}-${encodeURIComponent(memberKey)}`;
  return (
    <div className="float-right ml-1 flex-row gap-1 flex">
      <ImplementationLinkForMember
        domain={domain}
        implementationId="hermes"
        kind={kind}
        memberKey={memberKey}
        protocolImplementationData={protocolImplementationData}
      />
      <a href={cdpUrl} target="cdp-reference" title="View in CDP docs">
        <Image
          src="/images/chrome-devtools-circle-responsive.svg"
          width={24}
          height={24}
          alt="Chrome DevTools"
          className="inline-block"
        />
      </a>
    </div>
  );
}

function MemberDescription({
  member,
}: {
  member: {
    description?: string;
  };
}) {
  return (
    <>
      {'description' in member && member.description && (
        <Markdown>{member.description}</Markdown>
      )}
    </>
  );
}

function MemberParameters({
  member,
  domain,
  versionSlug,
}: {
  member: Protocol.Event | Protocol.Command;
  domain: string;
  versionSlug: string;
}) {
  return (
    <>
      {'parameters' in member && member.parameters && (
        <>
          <h4 className="font-bold text-lg mt-4 mb-2">Parameters</h4>
          <PropsTable
            items={member.parameters}
            domain={domain}
            versionSlug={versionSlug}
          />
        </>
      )}
    </>
  );
}

function TypeProperties({
  type,
  domain,
  versionSlug,
}: {
  type: Protocol.ProtocolType;
  domain: string;
  versionSlug: string;
}) {
  return (
    <>
      {'properties' in type && type.properties && (
        <>
          <h4 className="font-bold text-lg mt-4 mb-2">Properties</h4>
          <PropsTable
            items={type.properties}
            domain={domain}
            versionSlug={versionSlug}
          />
        </>
      )}
    </>
  );
}

function MethodReturnObject({
  command,
  domain,
  versionSlug,
}: {
  command: Protocol.Command;
  domain: string;
  versionSlug: string;
}) {
  return (
    <>
      {'returns' in command &&
        command.returns != null &&
        command.returns.length !== 0 && (
          <>
            <h4 className="font-bold text-lg mt-4 mb-2">Return object</h4>
            <PropsTable
              items={command.returns}
              domain={domain}
              versionSlug={versionSlug}
            />
          </>
        )}
    </>
  );
}

export async function generateStaticParams() {
  const params = [];
  for (const protocolVersion of Array.from(
    await protocolVersionsModel.protocolVersions(),
  )) {
    const { domains } = (await protocolVersion.protocol()).protocol;
    const { versionSlug } = await protocolVersion.metadata();
    for (const domain of domains) {
      params.push({
        version: versionSlug,
        domain: domain.domain,
      });
    }
  }
  return params;
}
