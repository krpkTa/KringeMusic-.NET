using Application.DTOs.Track;
using Domain;
using Domain.Interfaces;

namespace Application
{
    public class HistoryService
    {
        private readonly IPlayHistoryRepository _historyRepository;
        private readonly ITrackRepository _trackRepository;
        private readonly IUserRepository _userRepository;

        public HistoryService(
            IPlayHistoryRepository historyRepository,
            ITrackRepository trackRepository,
            IUserRepository userRepository)
        {
            _historyRepository = historyRepository;
            _trackRepository = trackRepository;
            _userRepository = userRepository;
        }

        public async Task AddPlayHistoryAsync(
            int userId,
            int trackId,
            string source,
            int durationPlayed,
            bool isSkipped,
            CancellationToken ct = default)
        {
            var user = await _userRepository.GetUserById(userId);
            if (user == null)
                throw new Exception($"User {userId} not found");

            var track = await _trackRepository.GetTrackById(trackId, ct);
            if (track == null)
                throw new Exception($"Track {trackId} not found");

            var history = new PlayedHistory
            {
                UserId = userId,
                TrackId = trackId,
                Source = source,
                DurationPlayed = durationPlayed,
                IsSkipped = isSkipped,
                ListeningDate = DateTime.UtcNow
            };

            await _historyRepository.AddHistoryAsync(history, ct);
        }

        public async Task<(List<PlayHistoryResponseDto> Items, int TotalCount)> GetUserHistoryAsync(
            int userId,
            int page = 1,
            int pageSize = 20,
            CancellationToken ct = default)
        {
            var (histories, totalCount) = await _historyRepository.GetUserHistoryAsync(userId, page, pageSize, ct);

            var dtos = histories.Select(h => MapToResponseDto(h)).ToList();
            return (dtos, totalCount);
        }

        private PlayHistoryResponseDto MapToResponseDto(PlayedHistory history)
        {
            return new PlayHistoryResponseDto
            {
                HistoryId = history.HistoryId,
                TrackId = history.TrackId,
                TrackName = history.Track?.Name ?? "Unknown",
                ArtistName = history.Track?.ArtistTracks?.FirstOrDefault(at => at.IsPrimary)?.Artist?.Name
                             ?? history.Track?.ArtistTracks?.FirstOrDefault()?.Artist?.Name
                             ?? "Unknown",
                Source = history.Source,
                DurationPlayed = history.DurationPlayed,
                IsSkipped = history.IsSkipped,
                ListeningDate = history.ListeningDate,
                TrackDuration = history.Track?.Duration
            };
        }
    }
}