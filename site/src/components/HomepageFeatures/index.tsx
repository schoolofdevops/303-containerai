import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Container-native, not Docker-native',
    icon: '📦',
    description: (
      <>
        One <code>compose.yaml</code> runs identically on Colima, OrbStack,
        Rancher Desktop, or Podman. Built on the OCI standard and the Compose
        Spec — free of paid Docker Desktop.
      </>
    ),
  },
  {
    title: 'One real use case, built step by step',
    icon: '🪜',
    description: (
      <>
        Go from a served model to naive RAG → Agentic RAG → a multi-agent crew,
        hand-authoring the stack service by service. Every module adds one
        deliberate step.
      </>
    ),
  },
  {
    title: 'Runs on a 16 GB laptop',
    icon: '💻',
    description: (
      <>
        Small quantized models and the native-server / containerized-app pattern
        keep every lab to ~4–6 GB. No cloud GPU required; Apple Silicon M1 or
        Windows 11 + WSL2 both work.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <span className={styles.featureIcon} role="img" aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
