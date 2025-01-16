/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Interaction, EntryPreProcessingHook, PerformanceEventTiming } from "./types";

export const DEFAULT_DURATION_THRESHOLD = 40;
// A list of longest interactions
export const interactionList: Interaction[] = [];
export const interactionsMap: Map<number, Interaction> = new Map();
export const entryPreProcessingCallbacks: EntryPreProcessingHook[] = [];

const MAX_INTERACTIONS_TO_CONSIDER = 10;

export const handleInteractionEntry = (entry: PerformanceEventTiming) => {
  entryPreProcessingCallbacks.forEach((cb) => cb(entry));

  if (!(entry.interactionId || entry.entryType === 'first-input')) return;

  const minLongestInteraction = interactionList[interactionList.length - 1];

  const existingInteraction = interactionsMap.get(entry.interactionId!);

  if (
    existingInteraction || interactionList.length < MAX_INTERACTIONS_TO_CONSIDER ||
    entry.duration > minLongestInteraction.latency
  ) {
    if (existingInteraction) {
      if (entry.duration > existingInteraction.latency) {
        existingInteraction.entries = [entry];
        existingInteraction.latency = entry.duration;
      } else if (
        entry.duration === existingInteraction.latency &&
        entry.startTime === existingInteraction.entries[0].startTime
      ) {
        existingInteraction.entries.push(entry);
      }
    } else {
      const interaction = {
        id: entry.interactionId!,
        latency: entry.duration,
        entries: [entry],
      };
      interactionsMap.set(interaction.id, interaction);
      interactionList.push(interaction);
    }

    // Sort the entries by latency
    interactionList.sort((a, b) => b.latency - a.latency);
    if (interactionList.length > MAX_INTERACTIONS_TO_CONSIDER) {
      interactionList
        .splice(MAX_INTERACTIONS_TO_CONSIDER)
        .forEach((i) => interactionsMap.delete(i.id));
    }
  }
};