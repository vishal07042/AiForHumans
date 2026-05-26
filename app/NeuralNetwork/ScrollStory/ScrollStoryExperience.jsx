"use client";

import { useEffect, useState } from "react";
import styles from "../neural-network.module.css";

const STEPS = [
  {
    id: "neuron",
    label: "01",
    kicker: "One opinion",
    title: "A neuron adds signals and decides whether to fire.",
    body: "The original article frames this as Bruno the dog deciding whether to bark. That is a strong opening because it strips away the mystique. A neuron takes a few inputs, adds weight to the ones that matter, and produces one number.",
    note: "Doorbell, footsteps, and a default bias all feed the same score.",
  },
  {
    id: "weights",
    label: "02",
    kicker: "Importance",
    title: "Weights are how the network decides what matters more.",
    body: "Each input gets multiplied by a weight before the values are summed. Positive weights push toward firing, negative weights suppress the result, and the bias offsets the decision even before new evidence appears.",
    note: "Weighted sum is the first real mechanical step.",
  },
  {
    id: "activation",
    label: "03",
    kicker: "Compression",
    title: "Activation turns raw math into a controlled output range.",
    body: "After the weighted sum, the value is passed through an activation function. In the original article that function is sigmoid, which makes the shift from low confidence to high confidence easy to visualize as a smooth curve instead of a hard cliff.",
    note: "Sigmoid maps messy totals into clean confidence values.",
  },
  {
    id: "layers",
    label: "04",
    kicker: "Composition",
    title: "Layers let simple neurons build more useful features together.",
    body: "A single neuron can only express a simple rule. Once neurons are stacked, early layers can detect primitives, middle layers can combine them, and later layers can turn that into a final classification. The power comes from composition, not from a magical single unit.",
    note: "Input layer to hidden layers to output layer.",
  },
  {
    id: "training",
    label: "05",
    kicker: "Correction",
    title: "Learning is repeated error correction, not a burst of insight.",
    body: "The model makes a guess, compares it to the right answer, computes loss, and nudges weights to do slightly better next time. Backpropagation tells the system which weights contributed to the error, and gradient descent applies the correction in small steps.",
    note: "Prediction, loss, adjustment, repeat.",
  },
  {
    id: "boundary",
    label: "06",
    kicker: "Geometry",
    title: "Classification looks like a boundary taking shape in space.",
    body: "The decision-boundary demo in the article is effective because it shows what the network is actually learning. It is not memorizing isolated points. It is shaping a separating rule through the data so similar examples land on the same side.",
    note: "The learned boundary is the model's rule made visible.",
  },
  {
    id: "scale",
    label: "07",
    kicker: "Scale",
    title: "Modern AI systems are still this loop, just massively scaled up.",
    body: "The same core ideas survive at larger scale: weighted connections, nonlinear activations, many layers, huge parameter counts, and lots of repeated updates. The gap between a toy neuron and a frontier model is mostly one of scale and architecture, not a different learning principle.",
    note: "Same recipe, many more parameters and much more compute.",
  },
];

function StoryVisual({ activeStep }) {
  switch (activeStep) {
    case 0:
      return (
        <div className={styles.storyVisualStage}>
          <div className={styles.storySignalList}>
            <div className={styles.storySignalHot}>Doorbell +0.8</div>
            <div className={styles.storySignalHot}>Footsteps +0.5</div>
            <div className={styles.storySignalMuted}>Couch comfort -0.4</div>
          </div>
          <div className={styles.storyDecisionCard}>
            <span className={styles.storyMiniLabel}>Bruno neuron</span>
            <strong className={styles.storyDecisionValue}>Bark</strong>
          </div>
        </div>
      );
    case 1:
      return (
        <div className={styles.storyVisualStage}>
          <div className={styles.storyFormulaCard}>
            <span className={styles.storyMiniLabel}>weighted sum</span>
            <strong>(0.8 x 0.9) + (0.5 x 0.7) - 0.4 + bias</strong>
          </div>
          <div className={styles.storyBars}>
            <span className={styles.storyBarHot} style={{ width: "84%" }} />
            <span className={styles.storyBarCool} style={{ width: "68%" }} />
            <span className={styles.storyBarMuted} style={{ width: "36%" }} />
          </div>
        </div>
      );
    case 2:
      return (
        <div className={styles.storyVisualStage}>
          <div className={styles.storyCurvePanel}>
            <div className={styles.storyCurveGrid} />
            <div className={styles.storyCurveTrace} />
            <div className={styles.storyCurveDot} />
          </div>
          <div className={styles.storyReadoutGrid}>
            <div>
              <span className={styles.storyMiniLabel}>input</span>
              <strong>2.1</strong>
            </div>
            <div>
              <span className={styles.storyMiniLabel}>output</span>
              <strong>0.89</strong>
            </div>
          </div>
        </div>
      );
    case 3:
      return (
        <div className={styles.storyVisualStage}>
          <div className={styles.storyNetworkGrid}>
            {[0, 1, 2].map((column) => (
              <div key={column} className={styles.storyNetworkColumn}>
                {[0, 1, 2, 3].map((node) => (
                  <span
                    key={`${column}-${node}`}
                    className={`${styles.storyNetworkNode} ${
                      column === 2 ? styles.storyNetworkNodeAccent : ""
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className={styles.storyLegendRow}>
            <span>edges</span>
            <span>patterns</span>
            <span>classification</span>
          </div>
        </div>
      );
    case 4:
      return (
        <div className={styles.storyVisualStage}>
          <div className={styles.storyLossPanel}>
            <div className={styles.storyLossBars}>
              {[78, 62, 49, 36, 22, 14].map((value) => (
                <span
                  key={value}
                  className={styles.storyLossBar}
                  style={{ height: `${value}%` }}
                />
              ))}
            </div>
          </div>
          <div className={styles.storyLoopRow}>
            <span>Predict</span>
            <span>Measure</span>
            <span>Adjust</span>
          </div>
        </div>
      );
    case 5:
      return (
        <div className={styles.storyVisualStage}>
          <div className={styles.storyBoundaryPanel}>
            <div className={styles.storyBoundaryLine} />
            <span className={styles.storyBoundaryDotHot} style={{ top: "18%", left: "18%" }} />
            <span className={styles.storyBoundaryDotHot} style={{ top: "40%", left: "30%" }} />
            <span className={styles.storyBoundaryDotHot} style={{ top: "68%", left: "16%" }} />
            <span className={styles.storyBoundaryDotCool} style={{ top: "24%", right: "18%" }} />
            <span className={styles.storyBoundaryDotCool} style={{ top: "48%", right: "28%" }} />
            <span className={styles.storyBoundaryDotCool} style={{ top: "74%", right: "20%" }} />
          </div>
          <div className={styles.storyReadoutGrid}>
            <div>
              <span className={styles.storyMiniLabel}>orange</span>
              <strong>Class A</strong>
            </div>
            <div>
              <span className={styles.storyMiniLabel}>blue</span>
              <strong>Class B</strong>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className={styles.storyVisualStage}>
          <div className={styles.storyScaleGrid}>
            <div className={styles.storyScaleCard}>
              <span className={styles.storyMiniLabel}>parameters</span>
              <strong>Up</strong>
            </div>
            <div className={styles.storyScaleCard}>
              <span className={styles.storyMiniLabel}>data</span>
              <strong>Up</strong>
            </div>
            <div className={styles.storyScaleCard}>
              <span className={styles.storyMiniLabel}>compute</span>
              <strong>Up</strong>
            </div>
          </div>
          <div className={styles.storyDecisionCard}>
            <span className={styles.storyMiniLabel}>same loop</span>
            <strong className={styles.storyDecisionValue}>Bigger model</strong>
          </div>
        </div>
      );
  }
}

export default function ScrollStoryExperience() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-story-step]"));
    if (!elements.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const nextStep = Number(entry.target.getAttribute("data-story-step"));
          setActiveStep(nextStep);
        });
      },
      {
        rootMargin: "-34% 0px -46% 0px",
        threshold: 0.2,
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, []);

  return (
    <div className={styles.pageStack}>
      <section className={styles.heroCard}>
        <div className={styles.storyHeroGrid}>
          <div>
            <p className={styles.eyebrow}>Scroll Story</p>
            <h2 className={styles.heroTitle}>Neural networks as a paced narrative.</h2>
            <p className={styles.heroBody}>
              The story below follows the structure that works best for scrollytelling:
              one active visual, short concept blocks, clear step changes, and the same
              theme as the rest of this section.
            </p>
          </div>
          <aside className={styles.metaCard}>
            <span className={styles.metaLabel}>Structure</span>
            <div className={styles.metaValue}>Sticky visual + step text</div>
            <div className={styles.metaCopy}>
              That pattern keeps context stable while the explanation moves forward, which
              is exactly what makes a scroll story easier to follow than a long static post.
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.storyIntroCards}>
        <article className={styles.storyIntroCard}>
          <span className={styles.metaLabel}>Narrative flow</span>
          <p>
            The sequence starts with one neuron, then expands to weights, activation,
            layers, learning, decision boundaries, and scale.
          </p>
        </article>
        <article className={styles.storyIntroCard}>
          <span className={styles.metaLabel}>Mobile behavior</span>
          <p>
            On smaller screens the sticky panel drops into normal flow, so the page stays
            readable without relying on precision scrolling.
          </p>
        </article>
      </section>

      <section className={styles.storyLayout}>
        <div className={styles.storyStickyColumn}>
          <div className={styles.storyStickyCard}>
            <div className={styles.storyStickyHeader}>
              <span className={styles.metaLabel}>Active beat</span>
              <strong>{STEPS[activeStep].label}</strong>
            </div>
            <StoryVisual activeStep={activeStep} />
            <p className={styles.storyStickyNote}>{STEPS[activeStep].note}</p>
          </div>
        </div>

        <div className={styles.storyStepColumn}>
          {STEPS.map((step, index) => (
            <article
              key={step.id}
              data-story-step={index}
              className={`${styles.storyStepCard} ${
                activeStep === index ? styles.storyStepCardActive : ""
              }`}
            >
              <p className={styles.storyStepEyebrow}>
                <span>{step.label}</span>
                {step.kicker}
              </p>
              <h3 className={styles.storyStepTitle}>{step.title}</h3>
              <p className={styles.storyStepBody}>{step.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
