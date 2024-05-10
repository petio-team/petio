import mongoose from 'mongoose';

import { BaseEntity } from '@/infra/entity/entity';

import { CreateMediaLibraryProps, MediaLibraryProps } from './types';

/**
 * Represents a MediaLibrary entity.
 */
export class MediaLibraryEntity extends BaseEntity<MediaLibraryProps> {
  /**
   * Creates a new MediaLibrary entity.
   * @param create - The properties to create the MediaLibrary entity.
   * @returns The newly created MediaLibrary entity.
   */
  static create(create: CreateMediaLibraryProps): MediaLibraryEntity {
    const id = new mongoose.Types.ObjectId().toString();
    const props: MediaLibraryProps = {
      ...create,
    };
    return new MediaLibraryEntity({ id, props });
  }

  get allowSync(): boolean {
    return this.props.allowSync;
  }

  get art(): string {
    return this.props.art;
  }

  get composite(): string {
    return this.props.composite;
  }

  get filters(): boolean {
    return this.props.filters;
  }

  get refreshing(): boolean {
    return this.props.refreshing;
  }

  get thumb(): string {
    return this.props.thumb;
  }

  get key(): string {
    return this.props.key;
  }

  get type(): string {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get agent(): string {
    return this.props.agent;
  }

  get scanner(): string {
    return this.props.scanner;
  }

  get language(): string {
    return this.props.language;
  }

  get uuid(): string {
    return this.props.uuid;
  }

  get scannedAt(): number {
    return this.props.scannedAt;
  }

  get content(): boolean {
    return this.props.content;
  }

  get directory(): boolean {
    return this.props.directory;
  }

  get contentChangedAt(): number {
    return this.props.contentChangedAt;
  }

  get hidden(): number {
    return this.props.hidden;
  }

  /**
   * Validates the MediaLibrary entity.
   */
  public validate(): void {}
}
